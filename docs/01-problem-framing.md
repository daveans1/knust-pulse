# Phase 1 — Problem Framing

## Problem Statement

KNUST students and staff lack a campus-native social platform with automated safety controls. General-purpose social networks do not reflect college structure, official announcements, or study-focused communities. At the same time, unmoderated user-generated content creates harassment risk, spreads misinformation, and overwhelms manual review teams.

KNUST Pulse addresses this gap by combining college-based communities with an automated content moderation pipeline and safety analytics. Students can share posts, SOS study requests, and weekly quiz updates within their college. Staff can publish announcements and review flagged content. Every new post passes through a hybrid rule-and-ML moderation service before publication, with human review for borderline cases.

## Stakeholders

| Stakeholder | Need |
|-------------|------|
| Students | Safe, college-specific feed and study support |
| Academic staff | Verified announcements and course-related discussion |
| Admin staff | Moderation queue and safety analytics |
| Project staff | Platform reliability and technical oversight |

## Computational Thinking Pillar Mapping

| CT Pillar | Application in KNUST Pulse |
|-----------|----------------------------|
| **Decomposition** | System split into frontend (Next.js), API (Spring Boot), moderation service (FastAPI), database (PostgreSQL), and analytics pipeline (Pandas ETL) |
| **Pattern recognition** | Detect toxic language patterns, repeat offenders, college-level risk trends, and engagement spikes |
| **Abstraction** | Domain models (`Post`, `ModerationLog`, `SafetyScore`) hide database and service complexity from UI and API consumers |
| **Algorithm design** | Feed ranking (greedy), moderation queue scheduling (priority heap), keyword search (Trie/Aho-Corasick), graph-based spread analysis (BFS), community recommendations (Dijkstra), fuzzy matching (DP edit distance), hybrid moderation heuristics, and ML classification pipeline |

## Success Criteria

1. Users can log in, create posts, and see a ranked feed of published content.
2. New posts are automatically scored and routed to approve, review, or remove states.
3. Staff can view the moderation queue and override AI decisions.
4. Safety metrics are aggregated and visualized for administrators.
5. Moderation performance is measured with precision, recall, F1, and latency.

## Scope Boundaries

**In scope:** Text post moderation, role-based access, feed ranking, moderation queue, safety analytics dashboard, ML-assisted classification.

**Out of scope (future work):** Image/video moderation, real-time push notifications, direct messaging, mobile native apps.

## CT Pillar Alignment Summary

KNUST Pulse maps directly to the assignment's computational thinking emphasis: students must design search, scheduling, greedy, graph, shortest-path, dynamic programming, heuristic, and machine learning algorithms before implementation. The moderation pipeline is the central algorithmic challenge; the social feed and analytics layers provide additional algorithm application points.
