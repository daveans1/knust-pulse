import type { FeedPost, PulseUser, Comment } from "./api";

export const seedCommunities = [
  { id: 1, name: "Katanga Hall", slug: "katanga-hall", description: "The heart of Katanga Hall life — events, banter, and hall spirit." },
  { id: 2, name: "Continental Hall", slug: "continental-hall", description: "Conti Nation lives here 👑" },
  { id: 3, name: "College of Engineering", slug: "college-of-engineering", description: "CoE students, projects, and campus life." },
  { id: 4, name: "College of Science", slug: "college-of-science", description: "CoS students and research discussions." },
  { id: 5, name: "Campus Life", slug: "campus-life", description: "Everything happening on KNUST campus." },
  { id: 6, name: "SRC & Student Life", slug: "src-student-life", description: "SRC elections, events, and student governance." },
  { id: 7, name: "Sports & Athletics", slug: "sports-athletics", description: "KNUST sports teams, results, and fitness." },
  { id: 8, name: "College of Health Sciences", slug: "college-of-health-sciences", description: "MBChB, Nursing, Pharmacy — all CoHS." },
  { id: 9, name: "Unity Hall", slug: "unity-hall", description: "Unity Hall events and community." },
  { id: 10, name: "Independence Hall", slug: "independence-hall", description: "Independence Hall updates and hall week." },
  { id: 11, name: "Angel Hall", slug: "angel-hall", description: "Angel Hall community." },
  { id: 12, name: "College of Art and Built Environment", slug: "college-of-art-and-built-environment", description: "Architecture, design and creative arts." },
  { id: 13, name: "College of Agriculture and Natural Resources", slug: "college-of-agriculture-and-natural-resources", description: "CANR students and agri discussions." },
  { id: 14, name: "Research & Grants", slug: "research-grants", description: "Research opportunities and academic achievements." },
  { id: 15, name: "Computer Science Society", slug: "computer-science-society", description: "CSS KNUST — tech, coding, and hackathons." },
];

export const seedUsers: PulseUser[] = [
  { id: 1, fullName: "Kwame Asante-Boateng", email: "kwame@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "3rd year CS. Katanga Hall. Python by day, debug by midnight 💻" },
  { id: 2, fullName: "Abena Serwaa", email: "abena@st.knust.edu.gh", role: "STUDENT", college: "College of Engineering", bio: "Mech Eng Level 400. Almost free. Conti girl 👑" },
  { id: 3, fullName: "Kofi Darko", email: "kofi@st.knust.edu.gh", role: "STUDENT", college: "College of Humanities and Social Sciences", bio: "Journalism & Media. CoHSS. SRC election observer & campus gossip correspondent 😂" },
  { id: 4, fullName: "Adjoa Mensah", email: "adjoa@st.knust.edu.gh", role: "STUDENT", college: "College of Health Sciences", bio: "MBChB Year 3. Sleep is a KNUST myth. Independence Hall 🏥" },
  { id: 5, fullName: "Nana Osei", email: "nana@st.knust.edu.gh", role: "STUDENT", college: "College of Art and Built Environment", bio: "Architecture. My studio is my home at this point 📐" },
  { id: 6, fullName: "Ama Darko", email: "ama@st.knust.edu.gh", role: "STUDENT", college: "College of Agriculture and Natural Resources", bio: "Agri-Business. Growing things, growing people 🌿" },
  { id: 7, fullName: "Yaw Frimpong", email: "yaw@st.knust.edu.gh", role: "STUDENT", college: "College of Engineering", bio: "EE Level 200. First time taking circuits, last time trusting myself 😭" },
  { id: 8, fullName: "Efua Bonsu", email: "efua@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Chemistry. The lab is where I speak fluently. Unity Hall. 🔬" },
  { id: 9, fullName: "Kojo Appiah", email: "kojo@st.knust.edu.gh", role: "STUDENT", college: "College of Engineering", bio: "Civil Eng. Katanga Hall President 2024. Hall week every year, baby 🏆" },
  { id: 10, fullName: "Esi Owusu", email: "esi@st.knust.edu.gh", role: "STUDENT", college: "College of Health Sciences", bio: "Nursing Level 200. Night shift practicums every week 😅" },
  { id: 11, fullName: "Prince Aboagye", email: "prince@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Physics. Akuafo Hall. My GPA and I are in a complicated relationship." },
  { id: 12, fullName: "Miriam Sarpong", email: "miriam@st.knust.edu.gh", role: "STUDENT", college: "College of Humanities and Social Sciences", bio: "Social Work Level 300. Mental health matters more than GPA. 💙" },
  { id: 13, fullName: "Benedict Ampah", email: "benedict@st.knust.edu.gh", role: "STUDENT", college: "College of Engineering", bio: "Comp Sci + Eng double degree. Send help. Angel Hall. 🤖" },
  { id: 14, fullName: "Dr. Grace Asante", email: "grace.asante@knust.edu.gh", role: "ACADEMIC_STAFF", college: "College of Engineering", bio: "Lecturer, Electrical Engineering. Research focus: sustainable energy." },
  { id: 15, fullName: "Admin Staff", email: "admin@knust.edu.gh", role: "ADMIN_STAFF", college: "Staff Lounge", bio: "KNUST Pulse Platform Administrator." },
  { id: 16, fullName: "Portia Kyei", email: "portia@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Math Level 400. Numbers are honest. People are not 😂. SRC Assembly Member." },
  { id: 17, fullName: "Selorm Baah", email: "selorm@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Cybersecurity. That guy who tells you to change your passwords. Unity Hall." },
  { id: 18, fullName: "Nadia Kwarteng", email: "nadia@st.knust.edu.gh", role: "STUDENT", college: "College of Humanities and Social Sciences", bio: "Film & Theatre. I direct, act, and edit. Conti Hall Drama rep. 🎬" },
  { id: 19, fullName: "Mawuli Dzokoto", email: "mawuli@st.knust.edu.gh", role: "STUDENT", college: "College of Agriculture and Natural Resources", bio: "Food Science. Will cook for study group. Final year." },
  { id: 20, fullName: "Joyce Amankwah", email: "joyce@st.knust.edu.gh", role: "STUDENT", college: "College of Health Sciences", bio: "Pharmacy. The only department where we still read textbooks 😩" },
];

// Diverse, authentic Ghanaian campus imagery from Unsplash
const campusImages = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80", // African students laughing
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80", // Students at desk studying
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80", // Study group on laptops
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80", // University campus walk
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80", // Night campus lights
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80", // Lecture hall
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80", // Sports / athletics
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80", // Library shelves
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80", // African street food
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80", // Students protest/rally
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80", // Students presenting
  "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=900&q=80", // Engineering work
];

// VOK Live style authentic KNUST content
const contentBank: Array<{ text: string; hasImage: boolean; imageIdx?: number; community: string }> = [
  { text: "Katanga Hall Week loading... The rest of KNUST better be scared 🔥 We're bringing the heat this year. #KatangaRises #HallWeek", hasImage: true, imageIdx: 0, community: "Katanga Hall" },
  { text: "Eduroam has been down since 8am. HOW am I supposed to submit this lab report by 5pm? @KNUST_IT please 😭😭😭", hasImage: false, community: "Campus Life" },
  { text: "The waakye at Katanga junction at 7am hits DIFFERENT. God bless that woman, she's literally feeding the next generation of engineers 🙏", hasImage: true, imageIdx: 8, community: "Campus Life" },
  { text: "Just found out my midsem is TOMORROW and I haven't opened a book. Catch me outside the exam hall crying in Electrical Engineering 😭 #MidsemSeason", hasImage: false, community: "College of Engineering" },
  { text: "Conti Hall girls serving looks on the first day back 👑💅 Rest can never compete fr. #ContiNation", hasImage: true, imageIdx: 0, community: "Continental Hall" },
  { text: "KNUST bus is 45 minutes late as usual. Walking to Ayeduase it is then. Why do I even pay for this 😤", hasImage: false, community: "Campus Life" },
  { text: "SRC election posters are up and the Photoshop level is INCREDIBLE this year 😂😂 Bro really put a galaxy background behind his face", hasImage: true, imageIdx: 10, community: "SRC & Student Life" },
  { text: "Bless whoever discovered that the 3 cedi kontomire stew from the Ohene Djan vendor gives you 4 hours of fuel. I owe that woman my degree 🙏", hasImage: false, community: "Campus Life" },
  { text: "Year 1 me thought KNUST would be like secondary school. Year 3 me is crying in Prempeh II Library at 2am. Nothing could have prepared me. 😂😭", hasImage: true, imageIdx: 7, community: "College of Science" },
  { text: "The makerspace is open late tonight for the robotics demo!! Come see Year 2 Mech Eng actually make something move 🤖 Faculty of Engineering Lab Block", hasImage: true, imageIdx: 11, community: "College of Engineering" },
  { text: "Off-campus rent just went up AGAIN in Ayeduase. Landlords are not playing with us this semester 😤 Fellow off-campers solidarity", hasImage: false, community: "Campus Life" },
  { text: "Python assignment due at midnight, my logic is wrong, my Wi-Fi is gone, and I'm running on pure coconut water. This is fine. 🙂🔥", hasImage: false, community: "College of Science" },
  { text: "Solidarity House gate closes at 10pm... so about our group project that runs to 10:30pm. Beautiful. Just beautiful 🙃", hasImage: false, community: "Campus Life" },
  { text: "NUGS-KNUST is hosting a mental health talk this Friday at Freedom Centre. PLEASE come through. We need this conversation on campus 💙", hasImage: true, imageIdx: 10, community: "SRC & Student Life" },
  { text: "KNUST girls walking to 7:30am lectures with full beat and proper outfit. Respect. I rolled in wearing my dorm slippers 🥴", hasImage: false, community: "Campus Life" },
  { text: "The cats on KNUST campus now outnumber some departments. They've colonized the space between library and science block. Iconic 🐱", hasImage: false, community: "Campus Life" },
  { text: "CoS students talking about research papers like we know what we're doing. I do NOT. But I'll nod and smile convincingly 😌📚", hasImage: true, imageIdx: 2, community: "College of Science" },
  { text: "Freedom Centre is booked back to back this month: Hall Week, then SRC debate, then Graduation Rehearsal. The events team deserves a raise 👏", hasImage: true, imageIdx: 5, community: "SRC & Student Life" },
  { text: "Lecturer dropped the exam date on us at 7:58pm on WhatsApp. Cool. Cool. COOL. 🙂 At least we know now I guess", hasImage: false, community: "College of Humanities and Social Sciences" },
  { text: "Hall week performances were 🔥 tonight at Unity Hall. The drama skit had me crying laughing. KNUST talent is unmatched 💯 #HallWeek2025", hasImage: true, imageIdx: 0, community: "Unity Hall" },
  { text: "Lunch queue at Republic Hall dining is giving absolute refugee camp energy 😭 but the jollof is honestly fire so I keep coming back", hasImage: true, imageIdx: 8, community: "Campus Life" },
  { text: "Architecture studio at 3am is a whole vibe. Everyone exhausted, soft music playing, someone is crying over AutoCAD. We're family at this point 🏛️", hasImage: true, imageIdx: 4, community: "College of Art and Built Environment" },
  { text: "Pharmacology test done. I either passed or I didn't. There's literally no way to know until the results. Trusting God at this point 🙏", hasImage: false, community: "College of Health Sciences" },
  { text: "Just realized I've been saying 'after exams I will rest' for 3 years straight. I have never once actually rested after exams. It's a cycle 😭", hasImage: false, community: "Campus Life" },
  { text: "The WiFi in Prempeh II Library just disconnected right when I was submitting my assignment. I am fine. Completely fine. 🙂🙂🙂 #EduroamDown", hasImage: true, imageIdx: 7, community: "Campus Life" },
  { text: "SRC elections are getting wild. The campaign WhatsApp broadcasts are coming in every 20 minutes 😂 My phone is overheating fr", hasImage: false, community: "SRC & Student Life" },
  { text: "Someone needs to tell the Level 100s that KNUST is not secondary school. The shock on their faces during first CAP is something else 😭", hasImage: true, imageIdx: 5, community: "Campus Life" },
  { text: "Katanga Hall vs Conti Hall debate this Friday. It's about to go DOWN. May the best hall win 👑 #HallWeekBanter", hasImage: false, community: "SRC & Student Life" },
  { text: "The Engineering block elevator has been broken for 3 weeks. We are climbing 6 floors with project equipment. This is cardio. This is PE. 😭", hasImage: false, community: "College of Engineering" },
  { text: "Best study spot secret: the reading room on floor 2 of Prempeh Library during lunch hour. Nobody knows about it. Shhhh 🤫📚", hasImage: true, imageIdx: 7, community: "Campus Life" },
  { text: "Group project members: 5. People who actually showed up to do work: 2. People who will still put their name on the report: 5. 😂 Classic KNUST experience", hasImage: false, community: "College of Science" },
  { text: "The KNUST football team won against UG tonight!! Freedom Centre watch party was ELECTRIC 🔥⚽ The comeback in the second half was unreal", hasImage: true, imageIdx: 6, community: "Sports & Athletics" },
  { text: "Food Science Level 400 made free samples again today 😍🍲 Come to the CANR building around 2pm if you see this in time. Running out fast!", hasImage: true, imageIdx: 8, community: "College of Agriculture and Natural Resources" },
  { text: "Independence Hall showing UP for hall week night 2. The float parade entry was genuinely stunning, I cried a little 😭🎨 #IndependenceHallForever", hasImage: true, imageIdx: 0, community: "Independence Hall" },
  { text: "The Cybersecurity club is hosting a CTF competition next week. Open to all colleges! First timers welcome, we have workshops beforehand 💻🔐", hasImage: true, imageIdx: 11, community: "College of Science" },
  { text: "MBChB Year 3 vibes: you're barely a doctor but the patients look at you like you know everything. The confidence has to carry you 😅🩺", hasImage: false, community: "College of Health Sciences" },
  { text: "Every semester I tell myself I'll study from day 1 and every semester I am here two weeks before exams 😂 Same story, different semester. Anyone else?", hasImage: false, community: "Campus Life" },
  { text: "Just got my CAP results 😅 Let's just say... I'm still enrolled. That's a win. That's a W. We celebrate small victories here. 🎉", hasImage: false, community: "Campus Life" },
  { text: "Thank you to whoever started the shared notes Google Drive for CoS Level 300. You are a hero. An actual hero. We don't deserve you 🙏📚", hasImage: true, imageIdx: 2, community: "College of Science" },
  { text: "Thesis submission is next week and I'm still on chapter 2. If you see me running across campus with a flash drive, pray for me 🏃‍♂️💨", hasImage: false, community: "Research & Grants" },
  { text: "Angel Hall float for hall week was built overnight by 20 people. None of us slept. It looked amazing. 10/10 worth it. #AngelHallStrong 🌟", hasImage: true, imageIdx: 3, community: "Angel Hall" },
];

export function buildSeedPosts(): FeedPost[] {
  return contentBank.map((item, index) => {
    const author = seedUsers[index % seedUsers.length];
    const hasMedia = item.hasImage && item.imageIdx !== undefined;
    const likeCount = 12 + (index % 20) * 7 + (index % 4) * 3;
    const commentCount = 1 + (index % 9);
    const viewCount = 120 + index * 43 + (index % 7) * 15;
    const repostCount = (index % 6);
    const shareCount = (index % 4);
    const createdAt = new Date(Date.now() - index * 41 * 60 * 1000).toISOString();
    
    // Generate some fake comments
    const comments: Comment[] = [];
    if (commentCount > 0) {
      for (let i = 0; i < commentCount; i++) {
        const commentAuthor = seedUsers[(index + i + 5) % seedUsers.length];
        const commentOptions = [
          "Absolutely agree with this 💯",
          "Bro this is too real 😭",
          "Can someone explain this? I'm lost.",
          "This is why I love KNUST.",
          "Wait, are you serious?",
          "I felt this in my soul.",
          "We need to do better honestly.",
          "Lmaooo I'm crying 😂",
          "Sending this to the group chat immediately.",
        ];
        comments.push({
          id: 10000 + index * 10 + i,
          author: commentAuthor,
          content: commentOptions[(index + i) % commentOptions.length],
          verifiedAnswer: false,
          createdAt: new Date(new Date(createdAt).getTime() + (i + 1) * 15 * 60000).toISOString(),
          likeCount: i,
          likedByCurrentUser: false,
        });
      }
    }

    return {
      id: 3000 + index,
      author,
      communityName: item.community,
      content: item.text,
      postType: hasMedia ? "IMAGE" : "TEXT",
      mediaUrl: hasMedia ? campusImages[item.imageIdx!] : null,
      mediaType: hasMedia ? "image" : null,
      status: "PUBLISHED",
      createdAt,
      likeCount,
      commentCount,
      likedByCurrentUser: false,
      viewCount,
      repostCount,
      shareCount,
      comments,
    };
  });
}
