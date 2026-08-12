package edu.knust.backend.controller;

import edu.knust.backend.dto.LoginRequest;
import edu.knust.backend.dto.LoginResponse;
import edu.knust.backend.dto.UserSummary;
import edu.knust.backend.entity.User;
import edu.knust.backend.repository.UserRepository;
import edu.knust.backend.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final JwtTokenProvider tokens;

    public AuthController(UserRepository users, JwtTokenProvider tokens) {
        this.users = users;
        this.tokens = tokens;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        if (request.email() == null || request.email().isBlank() ||
            request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        User user = users.findByEmail(request.email().trim().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No account found with that email address"));

        boolean passwordMatches = checkPassword(request.password(), user.getPasswordHash());
        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect password");
        }

        return new LoginResponse(
            tokens.generateToken(user),
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getRole(),
            user.getCollege(),
            user.getBio(),
            user.getAvatarUrl()
        );
    }

    /**
     * Flexible password check:
     * 1. If the stored hash starts with "$2" it's a BCrypt hash — use BCrypt.checkpw
     * 2. Otherwise treat stored value as plain-text (legacy seed data using 'hash123' etc.)
     */
    private boolean checkPassword(String rawPassword, String stored) {
        if (stored == null) return false;
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            try {
                return BCrypt.checkpw(rawPassword, stored);
            } catch (Exception e) {
                return false;
            }
        }
        // Plain-text fallback for legacy seed data
        return stored.equals(rawPassword);
    }

    @GetMapping("/me")
    public UserSummary me(@AuthenticationPrincipal User user) {
        return ApiMapper.user(user);
    }

    @GetMapping("/showcase-accounts")
    public List<UserSummary> showcaseAccounts() {
        return users.findAll().stream().limit(16).map(ApiMapper::user).toList();
    }
}
