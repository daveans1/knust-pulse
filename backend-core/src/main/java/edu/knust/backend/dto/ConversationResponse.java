package edu.knust.backend.dto;
import java.time.LocalDateTime;
public record ConversationResponse(UserSummary participant, String lastMessage, LocalDateTime lastMessageAt, long unreadCount) {}
