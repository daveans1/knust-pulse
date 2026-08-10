package edu.knust.backend.dto;

public record UserProfileResponse(UserSummary user, long postCount, long likesReceived, long followersCount, long followingCount, boolean isFollowing) {}
