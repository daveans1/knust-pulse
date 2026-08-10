package edu.knust.backend.controller;

import edu.knust.backend.dto.*;
import edu.knust.backend.entity.*;

final class ApiMapper {
    private ApiMapper() {}

    static UserSummary user(User user) {
        return new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getCollege(), user.getBio(), user.getAvatarUrl(), user.getSuspendedUntil(), user.getViolationCount() != null ? user.getViolationCount() : 0);
    }

    static CommentResponse comment(Comment comment) {
        return new CommentResponse(comment.getId(), user(comment.getAuthor()), comment.getContent(), Boolean.TRUE.equals(comment.getVerifiedAnswer()), comment.getCreatedAt());
    }

    static MessageResponse message(DirectMessage message) {
        return new MessageResponse(message.getId(), user(message.getSender()), user(message.getRecipient()), message.getContent(), message.getMediaUrl(), Boolean.TRUE.equals(message.getRead()), message.getCreatedAt());
    }
}
