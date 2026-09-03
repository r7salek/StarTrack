/**
 * ProjectCreateResponse DTO (Data Transfer Object) class
 * Used for transferring project data as a response structure.
 * Represents detailed information about a project after its creation or retrieval.
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
public class ProjectCreateResponse {

    // Fields representing project details

    /**
     * Unique identifier for the project.
     * Used for referencing or retrieving specific project entries.
     */
    private Long id;

    /**
     * Name of the project.
     * Represents the title or main identifier of the project.
     */
    private String projectName;

    // Principal Investigator (PI) details
    private String lastNamePI;   // Last name of the Principal Investigator (PI).
    private String firstNamePI;  // First name of the Principal Investigator (PI).
    private String emailPI;      // Email address of the PI.
    private String departmentPI; // Department associated with the PI.
    private String crsidPI;      // CRSID (Common Registration Service Identifier) of the PI.
    private String otherInforPI; // Additional information about the PI.

    // Technology Transfer Office (TTO) contact details
    private String ttoContractName;      // Name of the TTO contact person.
    private String ttoContractEmail;     // Email address of the TTO contact person.
    private String ttoContractOtherInfo; // Additional information about the TTO contact.

    // Modality and expertise details
    private String modality;        // Modality associated with the project.
    private String modalityOther;   // Additional information about modalities.
    private String areaOfExpertise; // Expertise area associated with the project.
    private String areaOfExpertiseOther; // Additional information about expertise areas.

    /**
     * Readiness level of the project.
     * Describes the project's stage or preparedness for execution.
     */
    private String readiness;

    // Project background and description
    private String projectBackground; // Detailed background of the project.
    private String briefDescription;  // Summary or high-level overview of the project.

    // Metadata for tracking
    private String createdEmail;  // Email of the user who created the project entry.
    private Date createdDate;     // Timestamp when the project entry was created.
    private String modifyEmail;   // Email of the user who last modified the project entry.

    /**
     * Application value or status of the project.
     * Describes the state or result of the application process.
     */
    private String applyValue;
}
