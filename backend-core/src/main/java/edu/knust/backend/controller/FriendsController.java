package edu.knust.backend.controller;

import edu.knust.backend.dto.UserSummary;
import edu.knust.backend.entity.Friendship;
import edu.knust.backend.entity.User;
import edu.knust.backend.repository.FriendshipRepository;
import edu.knust.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/friends")
public class FriendsController {
    private final FriendshipRepository friendships;
    private final UserRepository users;

    public FriendsController(FriendshipRepository friendships, UserRepository users) {
        this.friendships = friendships;
        this.users = users;
    }

    @PostMapping("/{userId}")
    public void request(@PathVariable Long userId, @AuthenticationPrincipal User current) {
        if (userId.equals(current.getId())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot add yourself");
        User target = users.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (friendships.findByRequesterIdAndAddresseeId(current.getId(), userId).isPresent()) return;
        Friendship friendship = new Friendship();
        friendship.setRequester(current);
        friendship.setAddressee(target);
        friendship.setStatus("PENDING");
        friendship.setCreatedAt(LocalDateTime.now());
        friendships.save(friendship);
    }

    @GetMapping
    public List<UserSummary> list(@AuthenticationPrincipal User current) {
        return friendships.findAllForUser(current.getId()).stream()
            .filter(friendship -> "ACCEPTED".equals(friendship.getStatus()))
            .map(friendship -> friendship.getRequester().getId().equals(current.getId()) ? friendship.getAddressee() : friendship.getRequester())
            .map(ApiMapper::user)
            .toList();
    }
}
