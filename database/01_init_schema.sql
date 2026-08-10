-- KNUST Pulse database schema for Phase 1

-- Create enums for strict category definitions
CREATE TYPE user_role AS ENUM ('STUDENT', 'ACADEMIC_STAFF', 'ADMIN_STAFF', 'PROJECT_STAFF');
CREATE TYPE knust_college AS ENUM ('CANR', 'CABE', 'CoHSS', 'CoE', 'CoHS', 'CoS', 'STAFF_ONLY');
CREATE TYPE post_type AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'ANNOUNCEMENT', 'SOS', 'POLL');
CREATE TYPE post_status AS ENUM ('PENDING', 'PUBLISHED', 'FLAGGED', 'REMOVED');
CREATE TYPE report_status AS ENUM ('OPEN', 'REVIEWED', 'CLOSED');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    college knust_college NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Colleges table
CREATE TABLE colleges (
    id SERIAL PRIMARY KEY,
    code knust_college UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT
);

-- Communities table
CREATE TABLE communities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    community_type VARCHAR(50) NOT NULL,
    college knust_college,
    is_private BOOLEAN DEFAULT FALSE,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    community_id INT REFERENCES communities(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    post_type post_type DEFAULT 'TEXT',
    media_url VARCHAR(500),
    is_anonymous BOOLEAN DEFAULT FALSE,
    status post_status DEFAULT 'PENDING',
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    views INT DEFAULT 0,
    reposts INT DEFAULT 0,
    shares INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    author_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_verified_answer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Moderation logs table
CREATE TABLE moderation_logs (
    id BIGSERIAL PRIMARY KEY,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    item_type VARCHAR(50) DEFAULT 'POST',
    ai_score DECIMAL(5,2),
    flagged_reason VARCHAR(255),
    reviewed_by INT REFERENCES users(id) ON DELETE SET NULL,
    final_decision post_status,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reported_by INT REFERENCES users(id) ON DELETE CASCADE,
    post_id INT REFERENCES posts(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status report_status DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Followers table
CREATE TABLE followers (
    follower_id INT REFERENCES users(id) ON DELETE CASCADE,
    following_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for demo presentation

INSERT INTO colleges (code, name, description) VALUES
('CANR', 'College of Agriculture and Natural Resources', 'Supporting KNUST agriculture and resource communities.'),
('CABE', 'College of Art and Built Environment', 'Housing architecture, design, and built environment disciplines.'),
('CoHSS', 'College of Humanities and Social Sciences', 'Connecting arts, social sciences and communication students.'),
('CoE', 'College of Engineering', 'Engineering communities and campus technology discussions.'),
('CoHS', 'College of Health Sciences', 'Health science students and staff collaboration space.'),
('CoS', 'College of Science', 'Science and computing communities for KNUST students.'),
('STAFF_ONLY', 'Staff Lounge', 'Private community for staff and project personnel.');

INSERT INTO users (full_name, email, password_hash, role, college, bio, avatar_url) VALUES
('Demo Student', 'demo@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoS', 'Computer Science student who loves coding, campus life, and helping classmates.', NULL),
('Akosua Mensah', 'akosua@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoS', 'Physics student who runs late-night review circles and weekend study sessions.', NULL),
('Kwame Mensah', 'kmensah@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoE', 'Engineering student sharing lab updates, hardware builds, and project check-ins.', NULL),
('Ama Osei', 'aosei@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoHSS', 'Arts and culture storyteller who turns campus events into thoughtful conversations.', NULL),
('Esi Owusu', 'esi@st.knust.edu.gh', 'demo123', 'STUDENT', 'CABE', 'Architecture student with a sketchbook habit and a love of public-space design.', NULL),
('Nana Kofi', 'nana@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoHS', 'Medical student who loves organized study groups and wellness check-ins.', NULL),
('Yaa Boateng', 'yaa@st.knust.edu.gh', 'demo123', 'STUDENT', 'CANR', 'Food systems student and campus volunteer who keeps community projects visible.', NULL),
('Abena Frimpong', 'abena@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoHSS', 'Theatre and writing student who lives for campus conversations and performance nights.', NULL),
('Kojo Asare', 'kojo@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoE', 'Builds campus tools, prototypes, and student-friendly software experiments.', NULL),
('Rita Agyeman', 'rita@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoS', 'Data and analytics enthusiast who loves structured learning and student hackathons.', NULL),
('Benedict Tetteh', 'benedict@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoE', 'Robotics club lead and weekend tinkerer who loves sharing prototypes with the community.', NULL),
('Miriam Darko', 'miriam@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoS', 'Chemistry student and meme curator who keeps study groups lively.', NULL),
('Seth Arthur', 'seth@st.knust.edu.gh', 'demo123', 'STUDENT', 'CABE', 'Urban design student who critiques sketches and loves campus conversations about space.', NULL),
('Dr. Grace Asante', 'grace.asante@knust.edu.gh', 'demo123', 'ACADEMIC_STAFF', 'CoE', 'Engineering lecturer and mentor who shares practical guidance with students.', NULL),
('Mrs. Efua Sarpong', 'efua.sarpong@knust.edu.gh', 'demo123', 'ADMIN_STAFF', 'STAFF_ONLY', 'Campus events and student welfare administrator focusing on safe participation.', NULL),
('Ibrahim Salifu', 'ibrahim@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoHS', 'Public health and student advocacy lead who keeps wellness updates visible.', NULL),
('Portia Asamoah', 'portia@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoHSS', 'Policy, culture, and city life enthusiast who loves panel discussions.', NULL),
('Daniel Aboagye', 'daniel@st.knust.edu.gh', 'demo123', 'STUDENT', 'CANR', 'Agronomy student and community gardener who organizes weekend support groups.', NULL),
('Selorm Baah', 'selorm@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoS', 'Cybersecurity club member who loves practical demos and quick how-to posts.', NULL),
('Joyce Ofori', 'joyce@st.knust.edu.gh', 'demo123', 'STUDENT', 'CoHS', 'Mental health and study hacks advocate who keeps campus-care conversations going.', NULL),
('Dr. Albert Owusu', 'aowusu@knust.edu.gh', 'demo123', 'ACADEMIC_STAFF', 'CoS', 'Lecturer and course supervisor who keeps the campus feed grounded in real academic life.', NULL),
('System Admin', 'admin@knust.edu.gh', 'demo123', 'ADMIN_STAFF', 'STAFF_ONLY', 'Campus safety administrator managing content moderation and student wellbeing.', NULL),
('IT Support', 'itsupport@knust.edu.gh', 'demo123', 'PROJECT_STAFF', 'STAFF_ONLY', 'Technical support staff keeping the platform running for students and staff.', NULL);

INSERT INTO communities (name, community_type, college, is_private, created_by) VALUES
('CoS Community', 'COLLEGE', 'CoS', FALSE, NULL),
('CoE Community', 'COLLEGE', 'CoE', FALSE, NULL),
('CoHSS Community', 'COLLEGE', 'CoHSS', FALSE, NULL),
('Campus Creatives', 'INTEREST', NULL, FALSE, NULL),
('Women in Tech', 'INTEREST', NULL, FALSE, NULL),
('Research & Grants Desk', 'PROJECT', NULL, FALSE, NULL),
('Sports & Wellness', 'INTEREST', NULL, FALSE, NULL),
('Announcements', 'OFFICIAL', NULL, FALSE, NULL),
('Staff Lounge', 'STAFF', 'STAFF_ONLY', TRUE, NULL);

INSERT INTO posts (author_id, community_id, content, post_type, is_anonymous, status, upvotes, downvotes) VALUES
(15, 8, 'Student affairs is hosting a campus care week next week with wellness talks, peer support booths, and practical advice for every year group.', 'ANNOUNCEMENT', FALSE, 'PUBLISHED', 24, 0),
(1, 1, 'SOS: I need help with the Java Spring Boot assignment. Can anyone explain how to wire the backend API?', 'SOS', FALSE, 'PUBLISHED', 12, 0),
(4, 3, 'The arts quad was full of energy tonight. Someone started a spontaneous open mic and half the crowd stayed to listen.', 'TEXT', TRUE, 'PUBLISHED', 21, 0),
(3, 2, 'The engineering lab Wi-Fi is still patchy after 6pm. If you are working on a build, maybe try the annex or the open study lounge.', 'TEXT', FALSE, 'PUBLISHED', 30, 0),
(10, 6, 'I found an excellent dataset for my final-year project and I am happy to share the source links with anyone working on agriculture or climate-related topics.', 'TEXT', FALSE, 'PUBLISHED', 22, 0),
(9, 5, 'We need two more people for the Saturday prototype sprint. We are building a campus navigation helper and could use UX feedback.', 'TEXT', FALSE, 'PUBLISHED', 27, 0),
(16, 7, 'Early morning runs on the sports fields have become my favorite reset before long lecture days. Anyone else trying to build a routine?', 'TEXT', FALSE, 'PUBLISHED', 20, 0),
(20, 4, 'The student film night this weekend has a great turnout already. Bring a friend if you want a break from assignments.', 'TEXT', FALSE, 'PUBLISHED', 33, 0),
(4, 8, 'Reminder: Capstone Project 78 submissions are due next Friday. Please upload your materials to the portal before the deadline.', 'ANNOUNCEMENT', FALSE, 'PUBLISHED', 18, 0),
(18, 6, 'The agriculture innovation club has a new research challenge and the response has been overwhelming. People with coding experience are especially welcome.', 'TEXT', FALSE, 'PUBLISHED', 25, 0),
(11, 2, 'The robotics team practice starts at 7:30 tonight. Bring a charger and patience — the soldering table is always chaos in the best way.', 'TEXT', FALSE, 'PUBLISHED', 17, 0),
(19, 7, 'A quick reminder that hydration and short walks help during exam week more than most people admit.', 'TEXT', FALSE, 'PUBLISHED', 29, 0),
(7, 9, 'The campus community garden feels calmer after classes. I am starting a small volunteer circle for anyone who wants to join.', 'TEXT', FALSE, 'PUBLISHED', 15, 0),
(14, 8, 'The keynote on applied design is filling up earlier than usual. If you are attending, arrive a few minutes early.', 'ANNOUNCEMENT', FALSE, 'PUBLISHED', 21, 0),
(12, 1, 'The open studio critique was incredibly useful tonight. One of the best parts of campus life is seeing how people solve the same problem in different ways.', 'TEXT', FALSE, 'PUBLISHED', 26, 0),
(2, 1, 'Does anyone have a solution for the calculus group quiz? I can share notes for CoS students.', 'TEXT', FALSE, 'PENDING', 5, 0);

INSERT INTO comments (post_id, author_id, content, is_verified_answer) VALUES
(2, 4, 'I can help you after class. Check the Week 5 Spring Boot notes and then send me your endpoint schema.', FALSE),
(2, 1, 'I found a good tutorial on REST controllers that helped me finish mine. Happy to send it.', TRUE),
(7, 16, 'I will join the run after classes if the weather stays clear.', FALSE),
(9, 16, 'I can join the prototype sprint and bring feedback from the UX side.', FALSE),
(11, 3, 'I will come by and help with the test setup.', FALSE),
(13, 8, 'That reminder is exactly what I needed this week.', FALSE);

INSERT INTO moderation_logs (post_id, ai_score, flagged_reason, reviewed_by, final_decision) VALUES
(16, 91.40, 'Potential threat language and emotional escalation.', 22, 'REMOVED'),
(15, 78.20, 'Toxic speech and personal attack content.', 22, 'FLAGGED');

INSERT INTO notifications (user_id, message, link, is_read) VALUES
(1, 'Your post has been approved and published to the College of Science community.', '/posts/2', FALSE),
(5, 'Two new posts require moderation review in the quarantine queue.', '/admin/moderation', FALSE),
(10, 'A new campus care week announcement has gone live for students across KNUST.', '/announcements', FALSE),
(16, 'The sports and wellness community has a new meetup planned for this weekend.', '/communities/7', FALSE);