/**
 * ProjectCreateDTO (Data Transfer Object) class
 * Represents the data structure used for creating and transferring project details.
 * Includes comprehensive project-related information, such as PI details, funding, group members, and outputs.
 */

package com.star_track.star_track.starTrack.dto;

import com.star_track.star_track.starTrack.model.OutputRows;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

// Lombok annotations to reduce boilerplate code
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@AllArgsConstructor   // Generates an all-arguments constructor
@NoArgsConstructor    // Generates a no-argument constructor
@ToString             // Generates a toString() method
public class ProjectCreateDTO {

    // Fields representing project details

    /**
     * Unique identifier for the project.
     * Used for referencing or updating existing projects.
     */
    private Long id;

    /**
     * Name of the project.
     * Represents the title or main identifier of the project.
     */
    private String projectName;

    // Principal Investigator (PI) details
    private String lastNamePI;  // Last name of the Principal Investigator (PI).
    private String firstNamePI; // First name of the Principal Investigator (PI).
    private String emailPI;     // Email address of the PI.
    private String departmentPI; // Department associated with the PI.
    private String crsidPI;     // CRSID (Common Registration Service Identifier) of the PI.
    private String otherInforPI; // Additional information about the PI.

    /**
     * List of group members associated with the project.
     * Includes details of contributors such as Postdocs or team members.
     */
    private List<GroupMemberRowsResponse> groupMemberRows;

    // Technology Transfer Office (TTO) contact details
    private String ttoContractName;       // Name of the TTO contact person.
    private String ttoContractEmail;      // Email address of the TTO contact person.
    private String ttoContractOtherInfo;  // Additional information about the TTO contact.

    /**
     * List of subcontractors involved in the project.
     * Provides details about external collaborators or service providers.
     */
    private List<SubContractorsRowsResponse> subContractorsRows;

    /**
     * List of PPI (Patient and Public Involvement) rows.
     * Captures details of public or patient engagement in the project.
     */
    private List<PpiRowsResponse> ppiRows;

    // Funding details
    private List<String> funding;         // List of funding sources or types.
    private String fundingOther;          // Additional funding details not covered in the list.
    private String duration;              // Duration of the project in a specific format (e.g., years/months).
    private String grantNumber;           // Grant number associated with the project.
    private String value;                 // Total funding value for the project.
    private String fundingNIHR;           // Details about NIHR funding.
    private String fundingNIHROther;      // Additional information about NIHR funding.
    private String fundingUKRIMRC;        // Details about UKRI-MRC funding.
    private String fundingUKRIMRCOther;   // Additional information about UKRI-MRC funding.
    private String fundingWellcomeTrust;  // Details about Wellcome Trust funding.
    private String fundingWellcomeTrustOther; // Additional information about Wellcome Trust funding.

    // Modality and expertise details
    private List<String> modality;       // List of modalities related to the project.
    private String modalityOther;        // Additional information about modalities.
    private List<String> areaOfExpertise; // List of expertise areas related to the project.
    private String areaOfExpertiseOther; // Additional information about areas of expertise.

    /**
     * Readiness level of the project.
     * Describes the project's stage or preparedness for execution.
     */
    private String readiness;

    // Project background and description
    private String projectBackground;    // Detailed background of the project.
    private String briefDescription;     // Summary or high-level overview of the project.

    /**
     * List of output rows associated with the project.
     * Represents deliverables, results, or key outcomes.
     */
    private List<OutputRowsResponse> outputRows;

    /**
     * List of collaboration rows associated with the project.
     * Captures details of partnerships or collaborations.
     */
    private List<CollaborationRowsResponse> collaborationRows;

    /**
     * List of external advisors associated with the project.
     * Provides information about advisory roles and contributions.
     */
    private List<ExternalAdvisorsRowsResponse> externalAdvisorsRows;

    /**
     * List of funding rows associated with the project.
     * Represents financial details and related metadata.
     */
    private List<FundingRowsResponse> fundingRows;

    /**
     * List of funding overview rows associated with the project.
     * Provides high-level summaries of funding information.
     */
    private List<FundingOverviewRowsResponse> fundingOverviewRows;

    /**
     * List of OTR (Operational Team Resources) rows.
     * Captures details about team resources and roles.
     */
    private List<otrRowsResponse> otrRows;
}
