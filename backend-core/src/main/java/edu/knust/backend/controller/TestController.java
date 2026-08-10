package edu.knust.backend.controller;

import edu.knust.backend.entity.Post;
import edu.knust.backend.model.PostStatus;
import edu.knust.backend.repository.PostRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class TestController {
    private final PostRepository postRepository;

    public TestController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping("/api/test-posts")
    public String testPosts() {
        List<Post> posts = postRepository.findByStatusWithAuthor(PostStatus.PUBLISHED, org.springframework.data.domain.PageRequest.of(0, 30));
        return posts.stream()
            .map(p -> "Post " + p.getId() + " - Comm: " + (p.getCommunity() != null ? p.getCommunity().getName() : "null"))
            .collect(Collectors.joining("\n"));
    }
}
