package edu.knust.backend.controller;

import edu.knust.backend.dto.FeedPostResponse;
import edu.knust.backend.entity.Community;
import edu.knust.backend.entity.User;
import edu.knust.backend.repository.CommunityRepository;
import edu.knust.backend.repository.PostRepository;
import edu.knust.backend.repository.PostLikeRepository;
import edu.knust.backend.repository.CommentRepository;
import edu.knust.backend.model.PostStatus;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {
    private final CommunityRepository communities;
    private final PostRepository posts;
    private final PostLikeRepository likes;
    private final CommentRepository comments;

    public CommunityController(CommunityRepository communities, PostRepository posts, PostLikeRepository likes, CommentRepository comments) {
        this.communities = communities;
        this.posts = posts;
        this.likes = likes;
        this.comments = comments;
    }

    @GetMapping
    public List<Community> list() {
        return communities.findAll();
    }

    @GetMapping("/{communityId}/posts")
    public List<FeedPostResponse> posts(@PathVariable Long communityId, @AuthenticationPrincipal User viewer) {
        Community community = communities.findById(communityId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
        return posts.findByCommunityIdAndStatusWithAuthor(community.getId(), PostStatus.PUBLISHED).stream().map(post -> feedPost(post, viewer)).toList();
    }

    private FeedPostResponse feedPost(edu.knust.backend.entity.Post post, User viewer) {
        return new FeedPostResponse(post.getId(), ApiMapper.user(post.getAuthor()), post.getCommunity() == null ? "KNUST Pulse" : post.getCommunity().getName(), post.getContent(), post.getPostType(), post.getMediaUrl(), post.getStatus(), post.getCreatedAt(), likes.countByPostId(post.getId()), comments.countByPostId(post.getId()), post.getViewCount(), post.getRepostCount(), post.getShareCount(), likes.existsByPostIdAndUserId(post.getId(), viewer.getId()));
    }
}
