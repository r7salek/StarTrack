/**
 * ExternalAdvisorsRowsResponse DTO (Data Transfer Object) class
 * Used for inserting and retrieving external advisor data.
 * Represents a response structure for external advisors' rows.
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
public class ExternalAdvisorsRowsResponse {

    // Fields representing external advisor data
    private Long id; // Unique identifier for the external advisor row

    private Date externalAdvisorsMeeting; // Date and time of the meeting with the external advisor

    private String externalAdvisorsOrganisation; // Organisation associated with the external advisor

    private String externalAdvisorsName; // Name of the external advisor

    private String externalAdvisorsEmail; // Email address of the external advisor

    private String externalAdvisorsOutcome; // Outcome of the engagement with the external advisor

    private String externalAdvisorsExpertise; // Area of expertise of the external advisor
}
