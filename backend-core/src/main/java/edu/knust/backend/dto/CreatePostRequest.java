package edu.knust.backend.dto;

public record CreatePostRequest(String content, Long communityId, String postType, String mediaUrl) {}
