/**
 * InitialProjectUpdateResponse DTO (Data Transfer Object) class
 * Used for transferring project update data as part of a response structure.
 * Represents detailed project-related updates and their associated metadata.
 */

package com.star_track.star_track.starTrack.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.star_track.star_track.starTrack.model.User;
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
public class InitialProjectUpdateResponse {

    // Fields representing project update data

    /**
     * Unique identifier for the project update record.
     * Used to identify a specific project update in the system.
     */
    private Long id;

    /**
     * Name of the project being updated.
     * Provides context for the project to which the update belongs.
     */
    private String projectName;

    /**
     * Date of the project update.
     * Indicates when the update was created or logged.
     */
    private Date date;

    /**
     * Summary of project connections.
     * Details key stakeholders or entities linked to the project.
     */
    private String connections;

    /**
     * Type of connections associated with the project.
     * Specifies the nature of the relationships, e.g., "Collaborators" or "Partners."
     */
    private String connectionsType;

    /**
     * Name of the Technology Transfer Office (TTO) involved in the project.
     * Highlights TTO's role in project facilitation.
     */
    private String tto;

    /**
     * Additional details about the TTO.
     * Provides context or supplementary information regarding TTO involvement.
     */
    private String ttoDetails;

    /**
     * Status or description of the project application process.
     * Details the progress or outcomes of applications related to the project.
     */
    private String application;

    /**
     * Outcome of the grant application for the project.
     * Captures whether the grant was awarded, rejected, or pending.
     */
    private String grantOutcome;

    /**
     * Scientific update or progress on the project.
     * Provides insights into the project's scientific advancements or findings.
     */
    private String scientificUpdate;

    /**
     * Details about project funding.
     * Summarizes financial support provided to the project.
     */
    private String funding;

    /**
     * Name of the funding scheme associated with the project.
     * Specifies the structure or type of funding initiative.
     */
    private String scheme;

    /**
     * Names of collaboration partners involved in the project.
     * Lists key organizations or individuals partnering on the project.
     */
    private String collaborationPartners;

    /**
     * Additional details about the collaboration partners.
     * Expands on their roles, contributions, or relationships with the project.
     */
    private String collaborationPartnersDetails;

    /**
     * Name of the grant project associated with the update.
     * Indicates the specific project funded by the grant.
     */
    private String grantProjectName;

    /**
     * Duration of the grant project.
     * Specifies the timeframe for the project supported by the grant.
     */
    private String grantProjectDuration;

    /**
     * Total value of the grant award.
     * Represents the monetary support allocated for the project.
     */
    private String grantAwardValue;

    /**
     * Key milestones of the grant project.
     * Lists significant targets or achievements expected during the grant period.
     */
    private String grantProjectMilestones;

    /**
     * Name of the grant funder.
     * Identifies the organization or entity providing the grant.
     */
    private String grantFunder;

    /**
     * Scheme associated with the grant.
     * Indicates the type or category of the grant funding.
     */
    private String grantScheme;

    /**
     * Collaboration partners involved in the grant project.
     * Highlights individuals or organizations collaborating under the grant.
     */
    private String grantCollaborationPartners;

    /**
     * Additional details about the collaboration partners in the grant project.
     * Provides further insights into their roles or contributions.
     */
    private String grantCollaborationPartnersDetails;

    /**
     * Information about additional funding sources for the grant project.
     * Specifies extra financial resources supplementing the primary grant.
     */
    private String grantAdditionalFunding;

    /**
     * Details about the additional funding for the grant project.
     * Expands on the sources, amounts, or purposes of the additional funding.
     */
    private String grantAdditionalFundingDetails;

    /**
     * Main types of contributions under the grant.
     * Specifies what the grant supports, such as research, equipment, or training.
     */
    private String grantMainTypeContributions;

    /**
     * Knowledge impact of the grant project.
     * Describes the grant's contribution to knowledge creation or dissemination.
     */
    private String grantKnowledgeImpact;

    /**
     * Additional details about the knowledge impact.
     * Expands on how the grant project influenced or advanced specific fields.
     */
    private String grantKnowledgeImpactDetails;

    /**
     * Email address of the user who created the project update.
     * Used for tracking and accountability.
     */
    private String createdEmail;

    /**
     * Email address of the user who last modified the project update.
     * Helps track changes and identify responsible users.
     */
    private String modifyEmail;

    /**
     * Timestamp for when the project update was created.
     * Indicates the original creation time of the record.
     */
    private Date createdDate;
}
