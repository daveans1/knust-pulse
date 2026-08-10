# Phase 2 — Algorithm Design (Pre-Implementation)

All algorithms documented here were designed before coding per assignment requirements.

## Decision Thresholds

| Score range | Action | Post status |
|-------------|--------|-------------|
| score < 30 | Auto-approve | PUBLISHED |
| 30 ≤ score < 70 | Human review | FLAGGED |
| score ≥ 70 | Auto-remove | REMOVED |

---

## 1. Search — Multi-Pattern Toxic Term Matching (Aho-Corasick)

**Use case:** Scan post text against a dictionary of toxic terms and patterns in one pass.

**Approach:** Build an Aho-Corasick automaton from keyword lists. Scan text in O(n + m) where n = text length, m = total pattern length.

```
function BUILD_AUTOMATON(patterns):
    trie ← empty trie root
    for each pattern in patterns:
        INSERT into trie
    ADD failure links (BFS over trie)
    return trie

function SCAN(text, automaton):
    matches ← []
    state ← root
    for i = 0 to len(text)-1:
        while state has no edge for text[i] and state ≠ root:
            state ← state.failure
        if edge exists:
            state ← state.next[text[i]]
        if state is terminal:
            matches.append(state.pattern)
    return matches
```

**Complexity:** O(n + m) scan time; O(m) build time.  
**Rationale:** Faster than naive O(n × k) substring search for k patterns.

---

## 2. Greedy — Feed Ranking

**Use case:** Rank posts for the home feed by relevance and engagement.

**Score formula:**
```
score(post) = w1 × recency(post) + w2 × engagement(post) + w3 × college_match(post, user)
```
- `recency = 1 / (1 + hours_since_post)`
- `engagement = upvotes - downvotes + comment_count`
- `college_match = 1 if same college else 0.3`

**Algorithm:**
```
function RANK_FEED(posts, user, k):
    scored ← []
    for each post in posts:
        s ← w1*recency(post) + w2*engagement(post) + w3*college_match(post, user)
        scored.append((post, s))
    sort scored by s descending          // greedy: pick best at each step
    return first k items from scored
```

**Complexity:** O(p log p) for p posts (sort-dominated).  
**Rationale:** Greedy top-k by composite score is simple and effective for campus feeds.

---

## 3. Scheduling — Moderation Review Queue (Priority Heap)

**Use case:** Staff review highest-risk posts first while respecting FIFO within equal priority.

**Priority key:** `(-ai_score, created_at)` — higher score first; older first on tie.

```
function ENQUEUE(queue, post, ai_score):
    heap_push(queue, (-ai_score, post.created_at, post.id))

function DEQUEUE_NEXT(queue):
    return heap_pop(queue).post

function BUILD_QUEUE(pending_posts):
    heap ← empty max-heap
    for each post in pending_posts:
        ENQUEUE(heap, post, post.latest_ai_score)
    return heap
```

**Complexity:** O(log n) per enqueue/dequeue; O(n log n) to build full queue.  
**Rationale:** Ensures urgent content is reviewed before lower-risk backlog.

---

## 4. Graph — Content Spread Analysis (BFS)

**Use case:** Estimate how far a flagged post reached via comments, shares, and upvotes.

**Graph:** Nodes = users and posts; edges = comment, upvote, share relationships.

```
function REACH(flagged_post, graph):
    visited ← empty set
    queue ← [flagged_post]
    count ← 0
    while queue not empty:
        node ← queue.pop_front()
        if node in visited: continue
        visited.add(node)
        count ← count + 1
        for each neighbor in graph.adjacent(node):
            queue.push_back(neighbor)
    return count, visited
```

**Complexity:** O(V + E) for BFS over interaction graph.  
**Rationale:** Safety analytics need reach metrics to prioritize high-spread harmful content.

---

## 5. Shortest Path — Community Recommendation (Dijkstra)

**Use case:** Suggest communities a user might join based on interaction weights.

**Graph:** Nodes = users and communities; edge weight = inverse interaction strength (lower = closer).

```
function RECOMMEND_COMMUNITIES(user, graph):
    dist ← DIJKSTRA(graph, source=user)
    communities ← filter nodes of type COMMUNITY
    sort communities by dist ascending
    return top 3 communities not yet joined by user
```

**Complexity:** O((V + E) log V) with binary heap.  
**Rationale:** Connects students to relevant college communities beyond their default enrollment.

---

## 6. Dynamic Programming — Fuzzy Toxic Term Detection (Levenshtein)

**Use case:** Catch obfuscated slurs (e.g., "st00pid", "idi0t") via edit distance to blocklist terms.

```
function LEVENSHTEIN(a, b):
    dp[0..m][0..n] ← infinity
    dp[0][0] ← 0
    for i = 1 to m:
        for j = 1 to n:
            cost ← 0 if a[i-1] == b[j-1] else 1
            dp[i][j] ← min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost)
    return dp[m][n]

function FUZZY_MATCH(token, blocklist, threshold):
    for term in blocklist:
        if LEVENSHTEIN(token, term) ≤ threshold:
            return true, term
    return false, null
```

**Complexity:** O(m × n) per token-term pair; applied to tokens only.  
**Rationale:** Rule-based exact match misses leetspeak and typos used to evade filters.

---

## 7. Heuristic — Hybrid Moderation Decision

**Use case:** Combine rule score and ML probability when model confidence is uncertain.

```
function HYBRID_MODERATE(text):
    rule_score, rule_reason ← RULE_ENGINE(text)
    ml_prob, ml_confidence ← ML_CLASSIFIER(text)

    if ml_confidence ≥ 0.85:
        final_score ← ml_prob × 100
        source ← "ML"
    else:
        final_score ← max(rule_score, ml_prob × 100)
        source ← "HYBRID"

    action ← THRESHOLD_ACTION(final_score)
    if action == REVIEW and ml_confidence < 0.6:
        action ← REVIEW   // always human-review low-confidence flags

    return final_score, action, source, rule_reason
```

**Complexity:** O(1) decision after scoring subroutines.  
**Rationale:** Rules catch known patterns fast; ML generalizes; heuristics arbitrate disagreement.

---

## 8. ML Pipeline — Toxicity Classification

**Use case:** Train and deploy a text classifier for campus-style toxic content.

**Pipeline:**
```
function TRAIN_PIPELINE(labeled_csv):
    texts, labels ← LOAD(labeled_csv)
    X_train, X_test, y_train, y_test ← train_test_split(texts, labels, test_size=0.2)

    vectorizer ← TfidfVectorizer(max_features=5000, ngram_range=(1,2))
    X_train_vec ← vectorizer.fit_transform(X_train)
    X_test_vec ← vectorizer.transform(X_test)

    model ← LogisticRegression(class_weight="balanced")
    model.fit(X_train_vec, y_train)

    y_pred ← model.predict(X_test_vec)
    metrics ← {precision, recall, f1} from classification_report

    SAVE(vectorizer, "vectorizer.joblib")
    SAVE(model, "model.joblib")
    return metrics
```

**Inference:**
```
function PREDICT(text, vectorizer, model):
    X ← vectorizer.transform([text])
    prob ← model.predict_proba(X)[0][1]   // P(toxic)
    return prob, max(prob, 1-prob)
```

**Complexity:** O(d) inference where d = feature dimension. Training O(n × d × iterations).  
**Rationale:** TF-IDF + logistic regression is interpretable, fast, and sufficient for text MVP.

---

## Algorithm-to-Feature Matrix

| Algorithm | Implemented in | Endpoint / Module |
|-----------|----------------|-------------------|
| Aho-Corasick / keyword search | `ai-moderation-engine/rules.py` | `POST /moderate` |
| Greedy feed ranking | `backend-core` FeedService | `GET /api/posts/feed` |
| Priority heap queue | `ai-moderation-engine/scheduler.py` | `GET /moderation/queue-priority` |
| BFS spread | `analytics/etl_moderation.py` | ETL transform step |
| Dijkstra communities | Future / documented | Design only for MVP |
| Levenshtein fuzzy match | `ai-moderation-engine/fuzzy.py` | `POST /moderate` |
| Hybrid heuristic | `ai-moderation-engine/classifier.py` | `POST /moderate` |
| ML pipeline | `ai-moderation-engine/train.py` | Offline training |
