/**
 * UserManagementResponse DTO (Data Transfer Object) class
 * Represents user management data for retrieving user details.
 * Includes essential information about users, their roles, and account status.
 */

package com.star_track.star_track.starTrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Date;

// Lombok annotations to reduce boilerplate code
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@AllArgsConstructor   // Generates an all-arguments constructor
@NoArgsConstructor    // Generates a no-argument constructor
@ToString             // Generates a toString() method
public class UserManagementResponse {

    /**
     * Unique identifier for the user.
     * Used to reference a specific user in the system.
     */
    private Long id;

    /**
     * First name of the user.
     * Represents the user's given name.
     */
    private String firstName;

    /**
     * Last name of the user.
     * Represents the user's family or surname.
     */
    private String lastName;

    /**
     * Email address of the user.
     * Used for communication and login purposes.
     */
    private String email;

    /**
     * The date when the user was created.
     * Useful for tracking account creation time.
     */
    private Date createdDate;

    /**
     * The date when the user record was last modified.
     * Tracks updates or changes to the user profile.
     */
    private Date modifiedDate;

    /**
     * Account status of the user.
     * Indicates whether the user account is enabled or active.
     */
    private boolean enabled;

    /**
     * Deletion status of the user account.
     * Indicates whether the account is marked for deletion.
     */
    private boolean delete;

    /**
     * The unique identifier for the user's role.
     * Represents the role ID in the system (e.g., Admin, User).
     */
    private long role_id;

    /**
     * The name or type of the user's role.
     * Describes the user's role within the system (e.g., "Admin", "User").
     */
    private String role;
}
