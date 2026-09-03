/**
 * CollaborationRowsResponse DTO (Data Transfer Object) class
 * Used for inserting and retrieving collaboration data.
 * Represents a response structure for collaboration rows.
 */

package com.star_track.star_track.starTrack.dto;

import lombok.*;

// Lombok annotations to reduce boilerplate code
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@AllArgsConstructor   // Generates an all-arguments constructor
@NoArgsConstructor    // Generates a no-argument constructor
@ToString             // Generates a toString() method
public class CollaborationRowsResponse {

    // Fields representing collaboration data
    private Long id; // Unique identifier for the collaboration row
    private String collaboration; // Name or type of the collaboration
    private String collaborationName; // Name of the collaborator
    private String collaborationEmail; // Email address of the collaborator
    private String collaborationLocation; // Location associated with the collaboration
    private String collaborationOtherInfo; // Additional information about the collaboration
}
