/**
 * PpiRowsResponse DTO (Data Transfer Object) class
 * Used for transferring data related to PPI (Patient and Public Involvement) rows.
 * Represents details about PPI meetings, contacts, groups, and outcomes.
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
public class PpiRowsResponse {

    // Fields representing PPI data

    /**
     * Unique identifier for the PPI row record.
     * Used to identify specific PPI entries in the system.
     */
    private Long id;

    /**
     * Date and time of the PPI meeting.
     * Represents when the PPI discussion or interaction occurred.
     */
    private Date ppiMeeting;

    /**
     * Contact details of the PPI representative or participant.
     * Stores the name or information of the key PPI contact.
     */
    private String ppiContact;

    /**
     * Group associated with the PPI meeting or interaction.
     * Represents the community, organization, or collective involved in the PPI activity.
     */
    private String ppiGroup;

    /**
     * Outcome of the PPI meeting or interaction.
     * Summarizes the results, decisions, or conclusions of the PPI activity.
     */
    private String ppiOutcome;
}
