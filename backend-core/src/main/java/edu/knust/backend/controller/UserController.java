package edu.knust.backend.controller;

import edu.knust.backend.dto.FeedPostResponse;
import edu.knust.backend.dto.UserProfileResponse;
import edu.knust.backend.entity.Post;
import edu.knust.backend.entity.User;
import edu.knust.backend.model.PostStatus;
import edu.knust.backend.repository.CommentRepository;
import edu.knust.backend.repository.PostLikeRepository;
import edu.knust.backend.repository.PostRepository;
import edu.knust.backend.repository.UserRepository;
import edu.knust.backend.repository.FollowRepository;
import edu.knust.backend.entity.Follow;
import edu.knust.backend.entity.FollowId;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users; private final PostRepository posts; private final PostLikeRepository likes; private final CommentRepository comments; private final FollowRepository follows;
    public UserController(UserRepository users, PostRepository posts, PostLikeRepository likes, CommentRepository comments, FollowRepository follows) { this.users = users; this.posts = posts; this.likes = likes; this.comments = comments; this.follows = follows; }

    @GetMapping
    public List<edu.knust.backend.dto.UserSummary> listUsers(@AuthenticationPrincipal User viewer) {
        return users.findAll().stream()
            .filter(u -> viewer == null || !u.getId().equals(viewer.getId()))
            .map(ApiMapper::user)
            .toList();
    }

    @GetMapping("/{userId}")
    public UserProfileResponse profile(@PathVariable @NonNull Long userId, @AuthenticationPrincipal User viewer) { User user = find(userId); return new UserProfileResponse(ApiMapper.user(user), posts.countByAuthorIdAndStatus(userId, PostStatus.PUBLISHED), likes.countLikesReceivedByAuthorId(userId), follows.countByFollowingId(userId), follows.countByFollowerId(userId), viewer != null && follows.existsByFollowerIdAndFollowingId(viewer.getId(), userId)); }

    @GetMapping("/{userId}/basic")
    public edu.knust.backend.dto.UserSummary basicProfile(@PathVariable @NonNull Long userId) {
        return ApiMapper.user(find(userId));
    }

    @GetMapping("/{userId}/posts")
    public List<FeedPostResponse> userPosts(@PathVariable @NonNull Long userId, @AuthenticationPrincipal User viewer) { return posts.findByAuthorIdAndStatusWithAuthor(userId, PostStatus.PUBLISHED).stream().map(post -> toFeed(post, viewer)).toList(); }

    @PostMapping("/{userId}/follow")
    @Transactional
    public void follow(@PathVariable @NonNull Long userId, @AuthenticationPrincipal User viewer) {
        if (viewer.getId().equals(userId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot follow yourself");
        User target = find(userId);
        if (!follows.existsByFollowerIdAndFollowingId(viewer.getId(), userId)) {
            Follow follow = new Follow();
            follow.setFollower(viewer);
            follow.setFollowing(target);
            follow.setCreatedAt(LocalDateTime.now());
            follows.save(follow);
        }
    }

    @DeleteMapping("/{userId}/follow")
    @Transactional
    public void unfollow(@PathVariable @NonNull Long userId, @AuthenticationPrincipal User viewer) {
        follows.findById(new FollowId(viewer.getId(), userId)).ifPresent(follows::delete);
    }

    private User find(@NonNull Long id) { return users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")); }
    private FeedPostResponse toFeed(Post post, User viewer) { return new FeedPostResponse(post.getId(), ApiMapper.user(post.getAuthor()), post.getCommunity() == null ? "KNUST Pulse" : post.getCommunity().getName(), post.getContent(), post.getPostType(), post.getMediaUrl(), post.getStatus(), post.getCreatedAt(), likes.countByPostId(post.getId()), comments.countByPostId(post.getId()), post.getViewCount() == null ? 0L : post.getViewCount(), post.getRepostCount() == null ? 0L : post.getRepostCount(), post.getShareCount() == null ? 0L : post.getShareCount(), likes.existsByPostIdAndUserId(post.getId(), viewer.getId())); }
}
