package edu.knust.backend.repository;

import edu.knust.backend.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ReportRepository extends JpaRepository<Report, Long> {
    @Modifying
    @Query("DELETE FROM Report r WHERE r.post.id = :postId")
    void deleteByPostId(Long postId);
}
