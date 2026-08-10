import type { FeedPost, PulseUser, Role } from "./api";

export type DemoCommunity = {
  id: number;
  name: string;
  badge: string;
  members: string;
  description: string;
  category: "college" | "interest" | "project";
  joined: boolean;
  college?: string | null;
};

export type DemoComment = {
  id: number;
  authorId: number;
  content: string;
  createdAt: string;
  likedByCurrentUser?: boolean;
  likeCount?: number;
};

const baseUsers: PulseUser[] = [
  { id: 1, fullName: "Campus Member", email: "campus@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Computer Science student building campus tools." },
  { id: 2, fullName: "Akosua Mensah", email: "akosua@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Physics student and late-night study partner." },
  { id: 3, fullName: "Kwame Mensah", email: "kmensah@st.knust.edu.gh", role: "STUDENT", college: "College of Engineering", bio: "Engineering student sharing project updates." },
  { id: 4, fullName: "Ama Osei", email: "aosei@st.knust.edu.gh", role: "STUDENT", college: "College of Humanities and Social Sciences", bio: "Arts and culture storyteller." },
  { id: 5, fullName: "Esi Owusu", email: "esi@st.knust.edu.gh", role: "STUDENT", college: "College of Art and Built Environment", bio: "Architecture student with a sketchbook habit." },
  { id: 6, fullName: "Nana Kofi", email: "nana@st.knust.edu.gh", role: "STUDENT", college: "College of Health Sciences", bio: "Medical student who loves organized study groups." },
  { id: 7, fullName: "Yaa Boateng", email: "yaa@st.knust.edu.gh", role: "STUDENT", college: "College of Agriculture and Natural Resources", bio: "Food systems student and campus volunteer." },
  { id: 8, fullName: "Abena Frimpong", email: "abena@st.knust.edu.gh", role: "STUDENT", college: "College of Humanities and Social Sciences", bio: "Loves theatre, writing, and campus conversations." },
  { id: 9, fullName: "Kojo Asare", email: "kojo@st.knust.edu.gh", role: "STUDENT", college: "College of Engineering", bio: "Builds campus tools and student products." },
  { id: 10, fullName: "Rita Agyeman", email: "rita@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Data and analytics enthusiast." },
  { id: 11, fullName: "Benedict Tetteh", email: "benedict@st.knust.edu.gh", role: "STUDENT", college: "College of Engineering", bio: "Robotics club lead and weekend tinkerer." },
  { id: 12, fullName: "Miriam Darko", email: "miriam@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Chemistry student and meme curator." },
  { id: 13, fullName: "Seth Arthur", email: "seth@st.knust.edu.gh", role: "STUDENT", college: "College of Art and Built Environment", bio: "Urban design student and sketch critique fan." },
  { id: 14, fullName: "Dr. Grace Asante", email: "grace.asante@knust.edu.gh", role: "ACADEMIC_STAFF", college: "College of Engineering", bio: "Engineering lecturer and mentor." },
  { id: 15, fullName: "Mrs. Efua Sarpong", email: "efua.sarpong@knust.edu.gh", role: "ADMIN_STAFF", college: "Staff Lounge", bio: "Campus events and student welfare." },
  { id: 16, fullName: "Ibrahim Salifu", email: "ibrahim@st.knust.edu.gh", role: "STUDENT", college: "College of Health Sciences", bio: "Public health and student advocacy." },
  { id: 17, fullName: "Portia Asamoah", email: "portia@st.knust.edu.gh", role: "STUDENT", college: "College of Humanities and Social Sciences", bio: "Interested in policy, culture, and city life." },
  { id: 18, fullName: "Daniel Aboagye", email: "daniel@st.knust.edu.gh", role: "STUDENT", college: "College of Agriculture and Natural Resources", bio: "Agronomy student and weekend gardener." },
  { id: 19, fullName: "Selorm Baah", email: "selorm@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Cybersecurity club member." },
  { id: 20, fullName: "Joyce Ofori", email: "joyce@st.knust.edu.gh", role: "STUDENT", college: "College of Health Sciences", bio: "Mental health, study hacks, and campus care." },
  { id: 21, fullName: "Kelvin Boateng", email: "kelvin@st.knust.edu.gh", role: "STUDENT", college: "College of Engineering", bio: "Makings prototypes and community software." },
  { id: 22, fullName: "Nadia Kwarteng", email: "nadia@st.knust.edu.gh", role: "STUDENT", college: "College of Humanities and Social Sciences", bio: "Film and storytelling lover." },
  { id: 23, fullName: "Prince Owusu", email: "prince@st.knust.edu.gh", role: "STUDENT", college: "College of Agriculture and Natural Resources", bio: "Research assistant and design thinker." },
  { id: 24, fullName: "Adjoa Biney", email: "adjoa@st.knust.edu.gh", role: "STUDENT", college: "College of Science", bio: "Focuses on community learning and hackathons." },
];

export const mockUsers = baseUsers;

export const mockCommunities: DemoCommunity[] = [
  { id: 1, name: "College of Science hub", badge: "CoS", members: "4.8k members", description: "Campus updates, study groups, and opportunities for science students.", category: "college", joined: true, college: "College of Science" },
  { id: 2, name: "Campus Creatives", badge: "CC", members: "1.2k members", description: "Photography, design, music, and storytelling collabs.", category: "interest", joined: true },
  { id: 3, name: "Women in Tech", badge: "WT", members: "762 members", description: "Mentorship, hack nights, and internship prep.", category: "interest", joined: false },
  { id: 4, name: "Hack Lab Sprint", badge: "HS", members: "430 members", description: "Weekly build sessions for prototypes and ship nights.", category: "project", joined: false },
  { id: 5, name: "Research & Grants Desk", badge: "RG", members: "510 members", description: "Calls for papers, grant tips, and supervisor matching.", category: "project", joined: false },
  { id: 6, name: "Sports & Wellness", badge: "SW", members: "984 members", description: "Training meetups, weekend games, and fitness groups.", category: "interest", joined: false },
  { id: 7, name: "SRC & Student Life", badge: "SRC", members: "2.1k members", description: "Events, announcements, and student advocacy updates.", category: "interest", joined: true },
  { id: 8, name: "Seminar Circle", badge: "SC", members: "658 members", description: "Talks, panel sessions, and campus knowledge sharing.", category: "interest", joined: false },
];

const buildPost = (index: number, authorId: number, communityId: number, content: string, postType: "TEXT" | "IMAGE" | "VIDEO" = "TEXT", mediaUrl?: string, likeCount = 0, commentCount = 0, viewCount = 0, repostCount = 0, shareCount = 0): FeedPost => ({
  id: 1000 + index,
  author: mockUsers.find((user) => user.id === authorId) ?? mockUsers[0],
  communityName: mockCommunities.find((community) => community.id === communityId)?.name ?? "Campus feed",
  content,
  postType,
  mediaUrl: mediaUrl ?? null,
  status: "PUBLISHED",
  createdAt: new Date(Date.now() - index * 45 * 60 * 1000).toISOString(),
  likeCount,
  commentCount,
  likedByCurrentUser: false,
  viewCount,
  repostCount,
  shareCount,
});

export const mockPosts: FeedPost[] = [
  buildPost(1, 2, 1, "The campus study lounge near the engineering annex is unusually calm tonight. I am taking full advantage of the silence for revision.", "TEXT", undefined, 41, 8, 184, 11, 6),
  buildPost(2, 4, 7, "SRC town hall starts at 6pm tomorrow. If you have questions about housing, transport, or student services, this is the right place to ask.", "TEXT", undefined, 36, 12, 215, 9, 7),
  buildPost(3, 5, 2, "The open studio critique was so helpful today. One of the best parts of campus life is seeing how people solve the same problem in different ways.", "TEXT", undefined, 27, 5, 101, 4, 3),
  buildPost(4, 6, 8, "Seminar reminder: Dr. Boateng will speak about public health communication at the main lecture hall at 4pm. Students from all colleges are welcome.", "TEXT", undefined, 33, 7, 130, 5, 2),
  buildPost(5, 9, 4, "Looking for two more people for the Saturday prototype sprint. We are building a campus-navigation helper and still need UX feedback.", "TEXT", undefined, 29, 6, 152, 8, 4),
  buildPost(6, 10, 5, "Found a neat dataset on regional rainfall and farming patterns. Sharing it in case any final-year project teams want fresh ideas.", "TEXT", undefined, 24, 4, 96, 3, 2),
  buildPost(7, 8, 3, "The Women in Tech meetup is filling up fast. If you are curious about product design or internships, come through this week.", "TEXT", undefined, 38, 10, 176, 6, 5),
  buildPost(8, 11, 4, "Robotics team practice is on tonight. Bring your charger and your patience — the soldering table is always chaos in the best way.", "TEXT", undefined, 18, 3, 87, 2, 1),
  buildPost(9, 12, 1, "If your labs are giving you stress, remember that mood matters just as much as notes. One short break can save a whole evening.", "TEXT", undefined, 15, 2, 79, 1, 1),
  buildPost(10, 13, 2, "The student mural walls are looking incredible lately. Someone should make a campus photo series out of them.", "TEXT", undefined, 17, 3, 94, 2, 2),
  buildPost(11, 16, 6, "Early morning run at the sports fields was exactly what I needed. Campus life feels lighter after a good workout.", "TEXT", undefined, 26, 4, 112, 4, 3),
  buildPost(12, 17, 7, "There is a student life panel on leadership and volunteering this Friday. I am going to try to make it if my schedule permits.", "TEXT", undefined, 21, 5, 105, 3, 2),
  buildPost(13, 18, 5, "The agriculture innovation club has a new research challenge. People with even a little coding experience are welcome.", "TEXT", undefined, 19, 2, 82, 2, 1),
  buildPost(14, 19, 1, "The study lounge near the science block is full again tonight, but the energy feels good. I am thinking of opening a quick revision circle after dinner.", "TEXT", undefined, 20, 4, 90, 2, 1),
  buildPost(15, 20, 6, "A reminder for anyone who needs it: hydration and short walks help more than we think during exam week.", "TEXT", undefined, 28, 6, 117, 2, 2),
  buildPost(16, 21, 4, "The prototype demo board is finally getting a clean layout. We are making progress faster than expected.", "TEXT", undefined, 22, 4, 128, 3, 3),
  buildPost(17, 22, 7, "There is a campus film night this weekend. Bring your friends if you want a good break from assignments.", "TEXT", undefined, 25, 5, 121, 5, 2),
  buildPost(18, 23, 5, "Huge respect to everyone who is balancing classes, work, and an application. Keep showing up even when it is messy.", "TEXT", undefined, 31, 8, 144, 6, 4),
  buildPost(19, 24, 1, "Study group at the new science block from 7pm. Bring your questions and a pen, and we will work through the tricky concepts together.", "TEXT", undefined, 30, 7, 138, 4, 2),
  buildPost(20, 3, 4, "The hackathon team has a few volunteer slots left for social media and logistics. If you like organising, come join the crew.", "TEXT", undefined, 26, 6, 120, 4, 2),
  buildPost(21, 1, 1, "The new campus event board is live. It is the easiest way to spot seminars, games, and occasional free snacks.", "TEXT", undefined, 34, 9, 165, 8, 6),
  buildPost(22, 7, 8, "This week’s seminar on climate and food systems had a packed room. The discussion felt practical, not abstract at all.", "TEXT", undefined, 23, 5, 103, 2, 1),
  buildPost(23, 15, 7, "Student affairs will host a campus care fair next week. Expect wellness talks, counselling resources, and peer support booths.", "TEXT", undefined, 29, 6, 136, 4, 3),
  buildPost(24, 14, 8, "The lecture theatre is filling up earlier than usual for the keynote on applied design. If you are attending, get there a bit early.", "TEXT", undefined, 37, 8, 183, 6, 5),
  buildPost(25, 2, 1, "Little campus win today: I finally found a good corner for focused work near the science building. The view is surprisingly nice.", "TEXT", undefined, 16, 3, 74, 2, 1),
  buildPost(26, 4, 7, "Who else is convinced that a proper campus snack break changes the whole mood of the day? I would pay for a bigger table in the common room.", "TEXT", undefined, 18, 4, 88, 2, 1),
  buildPost(27, 9, 4, "We are testing a new prototype at the engineering lab this evening. If you can critique the flow, come by.", "TEXT", undefined, 20, 5, 101, 3, 2),
  buildPost(28, 20, 6, "The running group is doing a light recovery loop after classes today. Great way to reset before tomorrow’s assignments.", "TEXT", undefined, 14, 3, 69, 2, 1),
  buildPost(29, 10, 5, "The best thing about this campus is how many people are willing to help when you ask. That matters more than I used to admit.", "TEXT", undefined, 21, 4, 98, 3, 2),
  buildPost(30, 5, 2, "Open studio tomorrow with free critique sessions. Bring one unfinished piece and one question. Everyone leaves with something useful.", "TEXT", undefined, 22, 6, 112, 3, 2),
  buildPost(31, 3, 4, "Prototype review at the innovation hub after 8pm. Great place to talk about product ideas and make them sharper.", "TEXT", undefined, 24, 5, 109, 3, 2),
  buildPost(32, 1, 1, "A quick campus reminder: the discussion rooms on the new side of campus are open late tonight for revision groups and project check-ins.", "TEXT", undefined, 19, 4, 85, 2, 1),
  buildPost(33, 8, 3, "The mentor circle for upcoming internships is open this week. This is a good one for people who want guidance without pressure.", "TEXT", undefined, 23, 4, 101, 3, 2),
  buildPost(34, 16, 6, "Small but real campus win: the wellness desk is handing out free tea and fruit this week. That kind of thing matters.", "TEXT", undefined, 17, 3, 83, 2, 1),
  buildPost(35, 23, 5, "If you have a research question and no clue where to begin, ask someone in the lab. Most of the best ideas start with one honest conversation.", "TEXT", undefined, 27, 5, 124, 4, 3),
  buildPost(36, 24, 1, "Nothing beats a calm Thursday evening in the common room with a laptop and a long to-do list. The vibe is surprisingly productive.", "TEXT", undefined, 12, 2, 60, 1, 1),
];

export const mockComments: Record<number, DemoComment[]> = {
  [1001]: [{ id: 1, authorId: 1, content: "The second floor is the sweet spot for me.", createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), likeCount: 4 }, { id: 2, authorId: 3, content: "I will bring my notes and join a short review session.", createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), likeCount: 2 }],
  [1002]: [{ id: 3, authorId: 2, content: "I am definitely going to that town hall.", createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), likeCount: 3 }],
  [1004]: [{ id: 4, authorId: 7, content: "I am planning to attend the seminar and bring a friend.", createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), likeCount: 2 }],
};

export function getUserById(userId?: number | null) {
  return mockUsers.find((user) => user.id === userId) ?? mockUsers[0];
}
