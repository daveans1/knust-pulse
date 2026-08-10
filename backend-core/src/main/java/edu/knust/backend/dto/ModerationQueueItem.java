package edu.knust.backend.dto;

import edu.knust.backend.model.PostStatus;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonRawValue;

public record ModerationQueueItem(
        Long postId,
        String authorName,
        String content,
        PostStatus status,
        Double aiScore,
        String flaggedReason,
        LocalDateTime createdAt,
        @JsonRawValue String highlightSpans,
        Integer authorViolationCount,
        LocalDateTime authorSuspendedUntil
) {}
