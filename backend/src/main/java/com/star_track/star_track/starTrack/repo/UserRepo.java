/**
 * UserRepo Interface
 * Repository for performing CRUD operations and custom queries on the `User` entity.
 * Provides methods for retrieving and managing user-related data.
 */

package com.star_track.star_track.starTrack.repo;

import com.star_track.star_track.starTrack.dto.UserManagementResponse;
import com.star_track.star_track.starTrack.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    /**
     * Retrieve all users with non-null email addresses.
     * Ensures that the result does not include users with null email fields.
     *
     * @return List of all distinct users where email is not null.
     */
    @Query("SELECT DISTINCT a FROM User a WHERE a.email IS NOT NULL")
    List<User> allUser();

    /**
     * Retrieve a user by their ID.
     *
     * @param id The unique identifier of the user.
     * @return Optional containing the user if found, or empty if not.
     */
    Optional<User> findDataById(Long id);

    /**
     * Retrieve a user by their email address.
     * Ensures that only users with non-null email addresses are included in the result.
     *
     * @param email The email address of the user.
     * @return The user object if a match is found, or null otherwise.
     */
    @Query("SELECT DISTINCT a FROM User a WHERE a.email IS NOT NULL AND a.email=?1")
    User findByEmail(String email);

    /**
     * Check if a user exists by their email address.
     *
     * @param email The email address to check.
     * @return True if a user with the given email exists, otherwise false.
     */
    boolean existsByEmail(String email);

    /**
     * Retrieve data for user management purposes.
     * Constructs a `UserManagementResponse` DTO for each user, including their role details.
     *
     * @return List of `UserManagementResponse` objects containing user management data.
     */
    @Query("SELECT new com.star_track.star_track.starTrack.dto.UserManagementResponse(su.id,su.firstName,su.lastName,su.email,su.createdDate,su.modifiedDate,su.enabled,su.delete,(r.id) AS role_id,(r.name) AS role) FROM User su JOIN su.roles r WHERE su.email IS NOT NULL")
    List<UserManagementResponse> userManagement();
}
