/**
 * RoleRepo Interface
 * Repository for performing CRUD operations and custom queries on the `Role` entity.
 * Provides methods for retrieving role-related data and custom queries.
 */

package com.star_track.star_track.starTrack.repo;

import com.star_track.star_track.starTrack.dto.TimeSlotData;
import com.star_track.star_track.starTrack.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RoleRepo extends JpaRepository<Role, Long> {

    /**
     * Find a role by its name.
     *
     * @param name The name of the role to find.
     * @return The `Role` object if found, or null if not.
     */
    Role findByName(String name);

    /**
     * Find a role by its unique identifier.
     *
     * @param id The ID of the role to find.
     * @return An `Optional` containing the `Role` if found, or empty if not.
     */
    Optional<Role> findDataById(Long id);

    /**
     * Retrieve all distinct roles.
     * Constructs a `TimeSlotData` DTO for each role, mapping the role's name to the `description` field.
     *
     * @return A list of `TimeSlotData` objects representing all distinct roles.
     */
    @Query(value = "select distinct new com.star_track.star_track.starTrack.dto.TimeSlotData( sp.name as description) from Role sp")
    List<TimeSlotData> findRoles();
}
