/**
 * UserPasswordResponse DTO (Data Transfer Object) class
 * Represents a user's password for data transfer purposes.
 * Primarily used for password-related operations, such as retrieval or updates.
 */

package com.star_track.star_track.starTrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

// Lombok annotations to reduce boilerplate code
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@AllArgsConstructor   // Generates an all-arguments constructor
@NoArgsConstructor    // Generates a no-argument constructor
@ToString             // Generates a toString() method
public class UserPasswordResponse {

    /**
     * The user's password.
     * Should be handled securely to prevent unauthorized access.
     */
    private String password;
}
