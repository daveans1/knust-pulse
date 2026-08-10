package edu.knust.backend.dto;

import edu.knust.backend.model.PostStatus;
import edu.knust.backend.model.PostType;
import java.time.LocalDateTime;

public record FeedPostResponse(Long id, UserSummary author, String communityName, String content, PostType postType, String mediaUrl, PostStatus status, LocalDateTime createdAt, long likeCount, long commentCount, long viewCount, long repostCount, long shareCount, boolean likedByCurrentUser) {}
