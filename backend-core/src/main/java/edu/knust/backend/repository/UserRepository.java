package edu.knust.backend.repository;

import edu.knust.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.violationCount > 0 OR u.suspendedUntil > CURRENT_TIMESTAMP ORDER BY u.violationCount DESC, u.suspendedUntil DESC")
    java.util.List<User> findTopViolators(org.springframework.data.domain.Pageable pageable);
}
