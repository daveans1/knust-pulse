package edu.knust.backend.dto;
public record SendMessageRequest(Long recipientId, String content, String mediaUrl) {}
