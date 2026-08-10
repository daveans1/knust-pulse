package edu.knust.backend.dto;

import java.time.LocalDateTime;
public record CommentResponse(Long id, UserSummary author, String content, boolean verifiedAnswer, LocalDateTime createdAt) {}
