package edu.knust.backend.repository;

import edu.knust.backend.entity.ModerationLog;
import edu.knust.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ModerationLogRepository extends JpaRepository<ModerationLog, Long> {
    Optional<ModerationLog> findTopByPostOrderByCreatedAtDesc(Post post);

    @Query("SELECT m FROM ModerationLog m JOIN FETCH m.post p JOIN FETCH p.author ORDER BY m.createdAt DESC")
    List<ModerationLog> findAllWithPosts();
}
