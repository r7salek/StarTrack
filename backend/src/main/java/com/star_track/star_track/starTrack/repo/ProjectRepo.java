package com.star_track.star_track.starTrack.repo;

import com.star_track.star_track.starTrack.model.Project;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepo extends JpaRepository<Project, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Project p where p.id = :id")
    Optional<Project> lockById(@Param("id") UUID id);
}
