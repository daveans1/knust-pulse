package edu.knust.backend.dto;

import edu.knust.backend.model.KnustCollege;
import edu.knust.backend.model.UserRole;

public record LoginResponse(
        String token,
        Long id,
        String fullName,
        String email,
        UserRole role,
        KnustCollege college,
        String bio,
        String avatarUrl
) {}
