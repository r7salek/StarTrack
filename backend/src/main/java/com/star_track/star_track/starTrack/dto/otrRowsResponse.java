/**
 * otrRowsResponse DTO (Data Transfer Object) class
 * Used for transferring data related to OTR (Operational/Organizational Team Resources) rows.
 * Represents details about team members, their roles, funding, and other relevant information.
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
public class otrRowsResponse {

    // Fields representing OTR (Operational/Organizational Team Resources) data

    /**
     * Unique identifier for the OTR row record.
     * Used to identify specific OTR entries in the system.
     */
    private Long id;

    /**
     * Name of the team member associated with the OTR entry.
     * Represents the individual contributing to the project or team.
     */
    private String otrTeamMember;

    /**
     * Role of the team member in the project or team.
     * Specifies the member's responsibilities or position within the group.
     */
    private String otrRole;

    /**
     * Details about the funding associated with the team member or role.
     * Describes the financial support provided for the specified role or team.
     */
    private String otrFunding;

    /**
     * Date associated with the OTR entry.
     * Could represent the date of allocation, assignment, or another key event.
     */
    private Date otrDate;

    /**
     * Additional information about the OTR entry.
     * Captures supplementary details not covered by other fields.
     */
    private String otrOtherInfo;
}
