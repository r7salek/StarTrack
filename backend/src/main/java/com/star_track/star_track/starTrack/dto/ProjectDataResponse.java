/**
 * ProjectDataResponse DTO (Data Transfer Object) class
 * Used for transferring detailed project-related data as part of a response.
 * Captures comprehensive information about a project, including funding, modalities, and metadata.
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
public class ProjectDataResponse {

    // Fields representing project details

    /**
     * Unique identifier for the project.
     * Used to identify or reference the project in the system.
     */
    private Long id;

    /**
     * Name of the project.
     * Represents the title or primary identifier of the project.
     */
    private String projectName;

    // Principal Investigator (PI) details
    private String lastNamePI;   // Last name of the Principal Investigator (PI).
    private String firstNamePI;  // First name of the Principal Investigator (PI).
    private String emailPI;      // Email address of the PI.
    private String departmentPI; // Department associated with the PI.
    private String crsidPI;      // CRSID (Common Registration Service Identifier) of the PI.
    private String otherInforPI; // Additional information about the PI.

    // Technology Transfer Office (TTO) details
    private String ttoContractName;      // Name of the TTO contact person.
    private String ttoContractEmail;     // Email address of the TTO contact person.
    private String ttoContractOtherInfo; // Additional information about the TTO contact.

    // Modality and expertise details
    private String modality;        // Project modality.
    private String modalityOther;   // Additional information about modalities.
    private String areaOfExpertise; // Expertise areas related to the project.
    private String areaOfExpertiseOther; // Additional details about areas of expertise.

    /**
     * Readiness level of the project.
     * Describes the project's stage or preparedness for implementation.
     */
    private String readiness;

    // Project background and description
    private String projectBackground; // Background information about the project.
    private String briefDescription;  // Summary or overview of the project.

    // Funding overview details
    private String fundingOverview;          // Overview of the project's funding.
    private String fundingOverviewOther;     // Additional funding details not covered in the overview.
    private String schemeOverview;           // Overview of the funding scheme.
    private int valueOverview;               // Total funding value for the project.
    private Date fundingOverviewStartDate;   // Start date of the funding period.
    private Date fundingOverviewEndDate;     // End date of the funding period.
    private String grantNumberOverview;      // Grant number associated with the project.
    private String worktribeNumberOverview;  // Worktribe number for internal tracking.

    // Metadata for tracking
    private String createdEmail;  // Email address of the user who created the project entry.
    private Date createdDate;     // Date and time when the project entry was created.
    private String modifyEmail;   // Email address of the user who last modified the project entry.

    /**
     * Application value or status of the project.
     * Describes the current state or result of the application process.
     */
    private String applyValue;
}
