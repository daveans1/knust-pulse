import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(title="Campus Moderation Engine V3")

# Enable CORS for the frontend Playground
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ModerationRequest(BaseModel):
    text: str
    author_id: str = "anonymous"
    is_dm: bool = False
    user_violation_count: int = 0

class ModerationResult(BaseModel):
    overall_risk_score: float
    priority_tier: str  # Changed to string for Java Jackson compatibility
    action: str
    post_status: str
    category_scores: Dict[str, float]
    vulgarity_word_count: int
    vulgarity_density_ratio: float
    flagged_reasons: List[str]
    context_overrides: List[str]
    safe: bool
    
    # Keeping old fields so Java backend deserialization does not break
    urgent: bool = False
    triggered_categories: List[str] = []
    pii_found: Dict[str, List[str]] = {}
    flagged_links: List[str] = []
    highlight_spans: List[Any] = []

class BulkModerationRequest(BaseModel):
    texts: List[str]

def normalize_text(raw_text: str) -> str:
    """
    Defeats basic obfuscation and evasion techniques.
    """
    text = raw_text.lower()
    
    # 1. Leetspeak mapping
    leetspeak_map = {
        '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
        '@': 'a', '$': 's', '!': 'i'
    }
    for k, v in leetspeak_map.items():
        text = text.replace(k, v)
        
    # 2. Remove punctuation injected inside words (e.g. f*ck -> fck, i.d.i.o.t -> idiot)
    # We strip all non-alphanumeric chars except spaces.
    text = re.sub(r'[^a-z0-9\s]', '', text)
    
    # 3. Squash repeated characters to a maximum of 2 (e.g. fuuuuuck -> fuuck)
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    
    return text

@app.get("/health")
def health():
    return {"status": "ok", "version": "3.0", "categories": ["severe_harm", "harassment", "vulgarity_density", "spam", "hate_speech", "sexual_harassment", "indirect_harm"]}

@app.post("/moderate", response_model=ModerationResult)
@app.post("/moderate/text", response_model=ModerationResult)
def moderate_text(req: ModerationRequest) -> ModerationResult:
    original_text = req.text
    norm_text = normalize_text(original_text)
    
    flagged_reasons = []
    context_overrides = []
    
    # ---------------------------------------------------------
    # Category 1: Severe Harm & Explicit Threats
    # ---------------------------------------------------------
    severe_harm_score = 0.0
    # Match direct physical verbs + targets
    harm_verbs = r"(kill|shoot|stab|murder|hurt|beat|destroy|attack|strangle|choke)"
    harm_targets = r"(you|him|her|them|yourself|someone|u)"
    if re.search(harm_verbs, norm_text) and re.search(harm_targets, norm_text):
        severe_harm_score = 95.0
        flagged_reasons.append("Direct threat or severe harm")
        
    # Match implicit/contextual threats (Stalking, menacing)
    implicit_threats = r"(watch your back|know where you|you wont make it|youre dead|im coming for you|sleep with one eye open)"
    if re.search(implicit_threats, norm_text):
        severe_harm_score = max(severe_harm_score, 85.0)
        flagged_reasons.append("Implicit threat or intimidation")

    # ---------------------------------------------------------
    # Category 2: Indirect Harm & Self-Harm Encouragement
    # ---------------------------------------------------------
    indirect_harm_score = 0.0
    self_harm_phrases = r"(drink bleach|play in traffic|walk off a pier|jump off a|end it all|waste of oxygen|waste of space|unalive)"
    if re.search(self_harm_phrases, norm_text):
        indirect_harm_score = 95.0
        flagged_reasons.append("Self-harm encouragement or extreme indirect harm")

    # ---------------------------------------------------------
    # Category 3: Hate Speech & Slurs
    # ---------------------------------------------------------
    hate_speech_score = 0.0
    # WARNING: These are strictly for detection purposes.
    slurs = r"\b(nigger|nigga|faggot|fag|tranny|retard|chink|spic|kike)\b"
    if re.search(slurs, norm_text):
        hate_speech_score = 100.0
        flagged_reasons.append("Hate speech or slurs")

    # ---------------------------------------------------------
    # Category 4: Sexual Harassment & Explicit Content
    # ---------------------------------------------------------
    sexual_harassment_score = 0.0
    sexual_phrases = r"(send nudes|show me your|send pics of|let me touch|suck my|ride my|seggs|grape|corn)"
    if re.search(sexual_phrases, norm_text):
        sexual_harassment_score = 90.0
        flagged_reasons.append("Sexual harassment or explicit content")

    # ---------------------------------------------------------
    # Category 5: Harassment & Bullying
    # ---------------------------------------------------------
    harassment_score = 0.0
    # Added Ghanaian (Twi/Pidgin) insults: kwasea, kwasia, aboa, gyimii, jon
    insult_pattern = r"(idiot|moron|stupid|dumb|dumbass|fool|useless|worthless|trash|loser|pathetic|disgusting|ugly|bitch|bastard|cunt|slut|whore|kwasea|kwasia|aboa|gyimii|jon|bitchass)"
    
    # Matches "you are a fool", "you fool", "ur stupid", "u idiot"
    harass_pattern = rf"\b((you|they|he|she|u|ur|your)\s+(are|r|is|were\s+)?(a\s+|an\s+|such\s+a\s+)?{insult_pattern}|you deserve to|you should|nobody likes you|youre a|ur a)\b"
    harass_matches = re.findall(harass_pattern, norm_text)
    
    # Also match isolated insults if they are standalone or exclamation
    isolated_insult_pattern = rf"\b{insult_pattern}\b"
    isolated_matches = re.findall(isolated_insult_pattern, norm_text)
    
    # Check for direct hostile commands
    direct_hostility = re.search(r"\b(fuck you|screw you|shut up|eat shit|go to hell)\b", norm_text)
    
    if harass_matches or direct_hostility:
        if len(harass_matches) > 1 or direct_hostility:
            harassment_score = 85.0
        else:
            harassment_score = 65.0
        if "Sexual harassment or explicit content" not in flagged_reasons and "Hate speech or slurs" not in flagged_reasons:
            flagged_reasons.append("Targeted harassment or bullying")
    elif isolated_matches:
        # Mild harassment for isolated insults like "fool", "idiot" without a target pronoun
        harassment_score = max(harassment_score, 45.0)
        if "Sexual harassment or explicit content" not in flagged_reasons and "Hate speech or slurs" not in flagged_reasons:
            if "Targeted harassment or bullying" not in flagged_reasons:
                flagged_reasons.append("General insults or uncivil behavior")
        
    # ---------------------------------------------------------
    # Category 6: Vulgarity Density
    # ---------------------------------------------------------
    # Comprehensive list including Ghanaian (Twi) vulgarity: trumu (anus), tw3 (vagina), koti (penis), hw3te
    vulgar_terms = {
        "fuck", "fucking", "fucked", "fucker", "fck", "fuk", "motherfucker", "muthafucka", 
        "shit", "shitty", "bullshit", "horseshit", "shat", 
        "bitch", "bitches", "bitching", "sonofabitch", "bitchass",
        "ass", "asshole", "asses", "dumbass", "jackass", "smartass", "badass",
        "bastard", "cunt", "cunts", "dick", "dicks", "dickhead", "cock", "cocks", "cocksucker",
        "pussy", "pussies", "whore", "whores", "slut", "sluts", "skank", "tramp", 
        "damn", "damned", "goddamn", "goddamnit", 
        "piss", "pissed", "pissing", "crap", "crappy",
        "wanker", "twat", "bollocks", "bugger", "wank",
        "wtf", "stfu", "lmao", "lmfao",
        "trumu", "tw3", "koti", "hw3te"
    }
    
    words = re.findall(r"\b\w+\b", norm_text)
    total_words = max(len(words), 1)
    
    # Count exact matches against the expanded dictionary
    vulgar_count = sum(1 for w in words if w in vulgar_terms)
    
    # Check multi-word profanities
    if "bloody hell" in norm_text:
        vulgar_count += 1
    if "piece of shit" in norm_text:
        vulgar_count += 1
        
    vulgarity_score = 0.0
    if vulgar_count == 1:
        vulgarity_score = 30.0
    elif vulgar_count == 2:
        vulgarity_score = 50.0
    elif vulgar_count == 3:
        vulgarity_score = 75.0   # 3 bad words is now an automatic P2 (FLAGGED)
    elif vulgar_count >= 4:
        vulgarity_score = 90.0   # 4+ bad words is an automatic P1 (REMOVED)
        
    density_ratio = vulgar_count / total_words
    
    # If the text is short and densely packed with profanity, escalate the score
    if density_ratio > 0.25 and vulgar_count >= 2:
        vulgarity_score = min(100.0, vulgarity_score + 15.0)
        
    if vulgarity_score >= 65.0 and "Targeted harassment or bullying" not in flagged_reasons:
        flagged_reasons.append(f"High vulgarity density ({vulgar_count} terms)")
        
    # ---------------------------------------------------------
    # Category 7: Spam & Fraud
    # ---------------------------------------------------------
    spam_score = 0.0
    spam_pattern = r"(exam (paper|answers|leak)|question paper|buy (grades|results)|click here to|easy money|get paid|100 pass|leaked questions|dm me for|check my bio|link in bio|cashapp|venmo)"
    if re.search(spam_pattern, norm_text):
        spam_score = 85.0
        flagged_reasons.append("Spam, fraud, or illicit promotion")
        
    url_count = len(re.findall(r"http[s]?://", original_text))
    if url_count >= 3:
        spam_score = max(spam_score, 75.0)
        if "Spam, fraud, or illicit promotion" not in flagged_reasons:
            flagged_reasons.append("Spam (multiple URLs)")

    # ---------------------------------------------------------
    # Context Whitelist (Overrides)
    # ---------------------------------------------------------
    safe_harm_pattern = r"(kill (the exam|it|the vibe|the process|the bug|that assignment|the presentation|that test)|shoot (a video|photos|a shot|the shot|hoops|a scene))"
    if re.search(safe_harm_pattern, norm_text):
        severe_harm_score = 0.0
        context_overrides.append("Safe slang (harm override)")
        if "Direct threat or severe harm" in flagged_reasons:
            flagged_reasons.remove("Direct threat or severe harm")
            
    if re.search(r"(fire (up|away|on all cylinders)|attack (mode|vector|the problem|the challenge|the exam)|slay|killed it|slayed|bodied that)", norm_text):
        context_overrides.append("Safe slang")
        
    if "garbage collection" in norm_text or "garbage collector" in norm_text:
        context_overrides.append("Programming term")
        harassment_score = 0.0
        
    if re.search(r"(bloody brilliant|bloody hell (that lecture|that tutorial))", norm_text):
        vulgarity_score = max(0.0, vulgarity_score - 30.0)
        context_overrides.append("Casual positive slang (vulgarity override)")
        
    if re.search(r"damn (that was|its|shes|hes|u) (good|fire|nice)", norm_text):
        vulgarity_score = max(0.0, vulgarity_score - 15.0)
        context_overrides.append("Casual positive slang (vulgarity override)")
        
    if req.is_dm and harassment_score > 0:
        harassment_score = min(100.0, harassment_score + 10.0)
        
    # ---------------------------------------------------------
    # Final Routing & Tier Assignment
    # ---------------------------------------------------------
    weighted_score = max(severe_harm_score, harassment_score) * 0.6 + vulgarity_score * 0.25 + spam_score * 0.15
    overall = max(severe_harm_score, indirect_harm_score, hate_speech_score, sexual_harassment_score, harassment_score, vulgarity_score, spam_score, weighted_score)
    overall = min(100.0, overall)
    
    if overall >= 85:
        tier = "1"
        action = "urgent_escalate"
        status = "REMOVED"
    elif overall >= 65:
        tier = "2"
        action = "remove_review"
        status = "FLAGGED"
    elif overall >= 40:
        tier = "3"
        action = "hide_review"
        status = "PUBLISHED"
    else:
        tier = "4"
        action = "allow"
        status = "PUBLISHED"
        
    # Fallback if no specific flagged reason
    if int(tier) < 4 and not flagged_reasons:
        flagged_reasons.append("Violates community guidelines")
        
    # Deduplicate reasons
    flagged_reasons = list(dict.fromkeys(flagged_reasons))

    return ModerationResult(
        overall_risk_score=overall,
        priority_tier=tier,
        action=action,
        post_status=status,
        category_scores={
            "severe_harm": severe_harm_score,
            "indirect_harm": indirect_harm_score,
            "hate_speech": hate_speech_score,
            "sexual_harassment": sexual_harassment_score,
            "harassment": harassment_score,
            "vulgarity_density": vulgarity_score,
            "spam": spam_score
        },
        vulgarity_word_count=vulgar_count,
        vulgarity_density_ratio=density_ratio,
        flagged_reasons=flagged_reasons,
        triggered_categories=flagged_reasons,
        context_overrides=context_overrides,
        safe=(tier == 4)
    )

@app.post("/bulk-moderate")
def bulk_moderate(req: BulkModerationRequest):
    return [moderate_text(ModerationRequest(text=t)) for t in req.texts]
