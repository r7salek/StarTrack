/**
 * SubContractorsRowsResponse DTO (Data Transfer Object) class
 * Used for transferring data related to subcontractors.
 * Represents details about subcontractors, including their expertise, organization, and contact information.
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
public class SubContractorsRowsResponse {

    // Fields representing subcontractor data

    /**
     * Unique identifier for the subcontractor record.
     * Used to identify specific subcontractors in the system.
     */
    private Long id;

    /**
     * Name of the subcontractor.
     * Represents the individual or entity providing subcontracted services.
     */
    private String subContractorsName;

    /**
     * Email address of the subcontractor.
     * Used for communication and correspondence.
     */
    private String subContractorsEmail;

    /**
     * Expertise or area of specialization of the subcontractor.
     * Highlights the subcontractor's skills or contributions to the project.
     */
    private String subContractorsExpertise;

    /**
     * Organization or company associated with the subcontractor.
     * Represents the subcontractor's professional affiliation or employer.
     */
    private String subContractorsOrganisation;

    /**
     * Additional information about the subcontractor.
     * Used to capture supplementary details not covered by other fields.
     */
    private String subContractorsOtherInfo;
}
