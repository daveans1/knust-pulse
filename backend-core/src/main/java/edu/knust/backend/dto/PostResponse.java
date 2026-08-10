package edu.knust.backend.dto;

import edu.knust.backend.model.KnustCollege;
import edu.knust.backend.model.PostStatus;
import edu.knust.backend.model.PostType;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        String authorName,
        String authorEmail,
        KnustCollege college,
        String content,
        PostType postType,
        PostStatus status,
        Integer upvotes,
        Integer downvotes,
        LocalDateTime createdAt,
        Double feedScore
) {}
