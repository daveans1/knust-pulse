package edu.knust.backend.repository;

import edu.knust.backend.entity.Follow;
import edu.knust.backend.entity.FollowId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowRepository extends JpaRepository<Follow, FollowId> {
    long countByFollowerId(Long followerId);
    long countByFollowingId(Long followingId);
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
