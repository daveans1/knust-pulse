package edu.knust.backend.controller;

import edu.knust.backend.dto.SearchResultItem;
import edu.knust.backend.entity.Community;
import edu.knust.backend.entity.Post;
import edu.knust.backend.entity.User;
import edu.knust.backend.repository.CommunityRepository;
import edu.knust.backend.repository.PostRepository;
import edu.knust.backend.repository.UserRepository;
import edu.knust.backend.model.PostStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {
    private final PostRepository posts;
    private final UserRepository users;
    private final CommunityRepository communities;

    public SearchController(PostRepository posts, UserRepository users, CommunityRepository communities) {
        this.posts = posts;
        this.users = users;
        this.communities = communities;
    }

    @GetMapping
    public List<SearchResultItem> search(@RequestParam String q) {
        String query = q == null ? "" : q.trim().toLowerCase();
        if (query.isBlank()) return List.of();

        List<SearchResultItem> results = new ArrayList<>();

        // Search posts
        posts.findAll().stream()
            .filter(post -> post.getStatus() != null && post.getStatus() == PostStatus.PUBLISHED)
            .filter(post -> post.getContent() != null && (
                post.getContent().toLowerCase().contains(query) ||
                (post.getCommunity() != null && post.getCommunity().getName().toLowerCase().contains(query))
            ))
            .limit(8)
            .forEach(post -> {
                String preview = post.getContent().length() > 80
                    ? post.getContent().substring(0, 80) + "…"
                    : post.getContent();
                String communityLabel = post.getCommunity() == null ? "Campus post" : post.getCommunity().getName();
                String authorHandle = post.getAuthor() == null ? "unknown" : post.getAuthor().getEmail().split("@")[0];
                results.add(new SearchResultItem(
                    "post",
                    preview,
                    "@" + authorHandle + " · " + communityLabel,
                    post.getId(),
                    "/"
                ));
            });

        // Search users
        users.findAll().stream()
            .filter(user -> user.getFullName().toLowerCase().contains(query)
                || user.getEmail().toLowerCase().contains(query)
                || (user.getCollege() != null && user.getCollege().name().toLowerCase().replace("_", " ").contains(query)))
            .limit(8)
            .forEach(user -> results.add(new SearchResultItem(
                "user",
                user.getFullName(),
                "@" + user.getEmail().split("@")[0] + " · " + (user.getCollege() != null ? user.getCollege().name().replace("_", " ") : "KNUST"),
                user.getId(),
                "/profile/" + user.getId()
            )));

        // Search communities
        communities.findAll().stream()
            .filter(community -> community.getName().toLowerCase().contains(query)
                || (community.getCommunityType() != null && community.getCommunityType().toLowerCase().contains(query))
                || (community.getCollege() != null && community.getCollege().name().toLowerCase().replace("_", " ").contains(query)))
            .limit(8)
            .forEach(community -> results.add(new SearchResultItem(
                "community",
                community.getName(),
                community.getCommunityType() != null ? community.getCommunityType() : "KNUST Community",
                community.getId(),
                "/communities/" + community.getName().toLowerCase().replace(" ", "-")
            )));


        return results;
    }
}
