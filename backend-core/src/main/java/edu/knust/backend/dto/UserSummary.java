package edu.knust.backend.dto;

import edu.knust.backend.model.KnustCollege;
import edu.knust.backend.model.UserRole;

import java.time.LocalDateTime;

public record UserSummary(Long id, String fullName, String email, UserRole role, KnustCollege college, String bio, String avatarUrl, LocalDateTime suspendedUntil, Integer violationCount) {}
