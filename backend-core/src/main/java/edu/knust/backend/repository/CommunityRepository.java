package edu.knust.backend.repository;

import edu.knust.backend.entity.Community;
import edu.knust.backend.model.KnustCollege;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findFirstByCollege(KnustCollege college);
}
