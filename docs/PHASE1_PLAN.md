# KNUST Pulse Phase 1 Plan

## Goal
Build the first workable stage of the KNUST Pulse app, focusing on:
- database schema and seed data
- authentication and user roles
- basic social feed and communities
- moderation status flow
- clear UI design for the initial MVP

## Phase 1 objectives
1. Define the data model for users, colleges, communities, posts, comments, quizzes, and moderation logs.
2. Create the database schema and seed the app with demo users, colleges, and sample posts.
3. Implement login and profile handling for student and staff roles.
4. Build the initial feed and post creation flow.
5. Add post status states and moderation metadata without full AI integration yet.
6. Design the UI layout for the home feed, community navigation, and profile.

## Phase 1 MVP features
- Role-based login using student or staff email
- Profile page showing role, college, and clash wins
- Community navigation and feed filtering
- Post creation with text, optional media, and SOS/announcement flags
- Commenting on posts
- Post status labels: Pending, Published, Flagged, Removed
- Seeded demo data for an engaging initial presentation

## User roles in Phase 1
- STUDENT
- ACADEMIC_STAFF
- ADMIN_STAFF
- PROJECT_STAFF

## Core page structure
- Login page
- Home feed page
- College community page
- Post detail / comments page
- Profile page
- Admin moderation placeholder page

## Initial UI layout
### Left sidebar
- KNUST Pulse logo
- Home
- My College
- Communities
- Quiz
- Messages
- Moderation (admin only)

### Center feed
- Post composer card
- Feed cards with author, college, content, media, and status
- Comments preview and post actions

### Right panel
- Trending posts or hashtags
- Weekly College Clash preview
- Quick status summary
- Notification preview

## Demo-ready content
### Must have seeded accounts
- demo@st.knust.edu.gh (student)
- lecturer@knust.edu.gh (academic staff)
- admin@knust.edu.gh (admin staff)
- itsupport@knust.edu.gh (project staff)

### Must have seeded colleges
- College of Agriculture and Natural Resources
- College of Art and Built Environment
- College of Humanities and Social Sciences
- College of Engineering
- College of Health Sciences
- College of Science

### Must have seeded posts
- campus announcement
- SOS post
- anonymous overheard post
- college help post
- demo flagged/approved posts

## Next step after Phase 1
- Add moderation queue and AI pipeline
- Add group and direct messaging support
- Add quiz and leaderboard gamification
- Add analytics dashboard for moderation and engagement
