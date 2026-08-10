package edu.knust.backend.dto;
import java.time.LocalDateTime;
public record MessageResponse(Long id, UserSummary sender, UserSummary recipient, String content, String mediaUrl, boolean read, LocalDateTime createdAt) {}
