/**
 * ProjectCreateRepo Interface
 * Repository for performing CRUD operations and custom queries on the `ProjectCreate` entity.
 * Facilitates data retrieval and management for project creation, history, and associated data.
 */
package com.star_track.star_track.starTrack.repo;

import com.star_track.star_track.starTrack.dto.*;
import com.star_track.star_track.starTrack.model.ProjectCreate;
import com.star_track.star_track.starTrack.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectCreateRepo extends JpaRepository<ProjectCreate, Long> {
    /**
     * Find a role by its ID.
     *
     * @param id The unique identifier of the role.
     * @return An `Optional` containing the role if found, or empty if not.
     */
    Optional<Role> findDataById(Long id);

    /**
     * Retrieve all project management data.
     * Orders projects by creation date in descending order.
     *
     * @return List of `ProjectCreateResponse` objects containing project details.
     */
    @Query("SELECT DISTINCT new com.star_track.star_track.starTrack.dto.ProjectCreateResponse(" +
            "d.id, d.projectName, d.lastNamePI, d.firstNamePI, d.emailPI, " +
            "d.departmentPI, d.crsidPI, d.otherInforPI, d.ttoContractName, " +
            "d.ttoContractEmail, d.ttoContractOtherInfo, " +
            "d.modality, d.modalityOther, d.areaOfExpertise, d.areaOfExpertiseOther, " +
            "d.readiness, d.projectBackground,d.briefDescription, d.applyUser.email as createdEmail, d.createdDate, d.modifyUser.email as modifyEmail, d.applyValue) " +
            "FROM ProjectCreate AS d order by d.createdDate desc")
    List<ProjectCreateResponse> getProjectCreateManagementData();
    /** Retrieve the latest project data.
     * Filters by the most recent creation date for each project name.
     *
             * @return List of `ProjectCreateResponse` objects with the latest project details.
            */
    @Query("SELECT DISTINCT new com.star_track.star_track.starTrack.dto.ProjectCreateResponse(" +
            "d.id, d.projectName, d.lastNamePI, d.firstNamePI, d.emailPI, " +
            "d.departmentPI, d.crsidPI, d.otherInforPI, d.ttoContractName, " +
            "d.ttoContractEmail, d.ttoContractOtherInfo, " +
            "d.modality, d.modalityOther, d.areaOfExpertise, d.areaOfExpertiseOther, " +
            "d.readiness, d.projectBackground,d.briefDescription, d.applyUser.email as createdEmail, d.createdDate, d.modifyUser.email as modifyEmail, d.applyValue) " +
            "FROM ProjectCreate AS d " +
            "WHERE d.createdDate = (" +
            "    SELECT MAX(d2.createdDate) " +
            "    FROM ProjectCreate d2 " +
            "    WHERE d2.projectName = d.projectName" +
            ") ORDER BY d.createdDate DESC")
    List<ProjectCreateResponse> getProjectCreateManagementDataLatest();

    /**
     * Retrieve the project history data for a specific project name.
     * Filters out the most recent creation date.
     *
     * @param data1 The project name to retrieve history for.
     * @return List of `ProjectCreateResponse` objects with historical data.
     */
    @Query("SELECT DISTINCT new com.star_track.star_track.starTrack.dto.ProjectCreateResponse(" +
            "d.id, d.projectName, d.lastNamePI, d.firstNamePI, d.emailPI, " +
            "d.departmentPI, d.crsidPI, d.otherInforPI, d.ttoContractName, " +
            "d.ttoContractEmail, d.ttoContractOtherInfo, " +
            "d.modality, d.modalityOther, d.areaOfExpertise, d.areaOfExpertiseOther, " +
            "d.readiness, d.projectBackground,d.briefDescription, d.applyUser.email as createdEmail, d.createdDate, d.modifyUser.email as modifyEmail, d.applyValue) " +
            "FROM ProjectCreate AS d " +
            "WHERE d.createdDate <> (" +
            "    SELECT MAX(d2.createdDate) " +
            "    FROM ProjectCreate d2 " +
            "    WHERE d2.projectName = d.projectName" +
            ") AND d.projectName = ?1 ORDER BY d.createdDate DESC")
    List<ProjectCreateResponse> getCreateProjectDataHistory(String data1);
    /**
     * Retrieve group member rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `GroupMemberRowsResponse` objects with group member details.
     */
    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.GroupMemberRowsResponse(sp.id,sr1.lastNamePostDoc,sr1.firstNamePostDoc,sr1.emailPostDoc,sr1.departmentPostDoc,sr1.positionPostDoc,sr1.crsidPostDoc,sr1.otherInforPostDoc) from ProjectCreate sp JOIN sp.groupMemberRows sr1 WHERE sp.id in (?1)")
    List<GroupMemberRowsResponse> findGroupMemberRows(Long id);

    /**
     * Retrieve output rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `OutputRowsResponse` objects with group member details.
     */
    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.OutputRowsResponse(sr.id,sr.output,sr.confirmation,sr.outputQuantity,sr.output_description) from ProjectCreate sp JOIN sp.outputRows sr WHERE sp.id in (?1)")
    List<OutputRowsResponse> findOutputRows(Long id);

    /**
     * Retrieve collaboration rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `CollaborationRowsResponse` objects with collaboration details.
     */

    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.CollaborationRowsResponse(sr1.id,sr1.collaboration,sr1.collaborationName,sr1.collaborationEmail,sr1.collaborationLocation,sr1.collaborationOtherInfo) from ProjectCreate sp JOIN sp.collaborationRows sr1 WHERE sp.id in (?1)")
    List<CollaborationRowsResponse> findCollaborationRows(Long id);

    /**
     * Retrieve external advisor rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `ExternalAdvisorsRowsResponse` objects with external advisor details.
     */
    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.ExternalAdvisorsRowsResponse(sr1.id,sr1.externalAdvisorsMeeting,sr1.externalAdvisorsOrganisation,sr1.externalAdvisorsName,sr1.externalAdvisorsEmail,sr1.externalAdvisorsOutcome,sr1.externalAdvisorsExpertise) from ProjectCreate sp JOIN sp.externalAdvisorsRows sr1 WHERE sp.id in (?1)")
    List<ExternalAdvisorsRowsResponse> findExternalAdvisorsRows(Long id);

    /**
     * Retrieve subcontractor rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `SubContractorsRowsResponse` objects with subcontractor details.
     */
    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.SubContractorsRowsResponse(sr1.id,sr1.subContractorsName,sr1.subContractorsEmail,sr1.subContractorsExpertise,sr1.subContractorsOrganisation,sr1.subContractorsOtherInfo) from ProjectCreate sp JOIN sp.subContractorsRows sr1 WHERE sp.id in (?1)")
    List<SubContractorsRowsResponse> findSubcontractorsRows(Long id);

    /**
     * Retrieve PPI (Patient and Public Involvement) rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `PpiRowsResponse` objects with PPI details.
     */
    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.PpiRowsResponse(sr1.id,sr1.ppiMeeting,sr1.ppiContact,sr1.ppiGroup,sr1.ppiOutcome) from ProjectCreate sp JOIN sp.ppiRows sr1 WHERE sp.id in (?1)")
    List<PpiRowsResponse> findPpiRows(Long id);

    /**
     * Retrieve OTR (Operational Team Resources) rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `otrRowsResponse` objects with OTR details.
     */
    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.otrRowsResponse(sr1.id,sr1.otrTeamMember,sr1.otrRole,sr1.otrFunding,sr1.otrDate,sr1.otrOtherInfo) from ProjectCreate sp JOIN sp.otrRows sr1 WHERE sp.id in (?1)")
    List<otrRowsResponse> findOTRRows(Long id);

    /**
     * Retrieve funding rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `FundingRowsByID` objects with funding details.
     */
    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.FundingRowsByID(sr1.id,sr1.funding,sr1.fundingOther,sr1.fundingNIHR,sr1.fundingNIHROther,sr1.fundingUKRIMRC,sr1.fundingUKRIMRCOther,sr1.fundingWellcomeTrust,sr1.fundingWellcomeTrustOther,sr1.scheme,sr1.schemeOther,sr1.value,sr1.fundingStartDate,sr1.fundingEndDate,sr1.aims,sr1.grantNumber,sr1.worktribeNumber) from ProjectCreate sp JOIN sp.fundingRows sr1 WHERE sp.id in (?1)")
    List<FundingRowsByID> findFundingRows(Long id);

    /**
     * Retrieve funding overview rows associated with a project by ID.
     *
     * @param id The project ID.
     * @return List of `FundingOverviewRowsByID` objects with funding overview details.
     */
    @Query(value = "select DISTINCT new com.star_track.star_track.starTrack.dto.FundingOverviewRowsByID(sr1.id,sr1.fundingOverview,sr1.fundingOverviewOther,sr1.fundingOverviewNIHR,sr1.fundingOverviewNIHROther,sr1.fundingOverviewUKRIMRC,sr1.fundingOverviewUKRIMRCOther,sr1.fundingOverviewWellcomeTrust,sr1.fundingOverviewWellcomeTrustOther,sr1.schemeOverview,sr1.schemeOverviewOther,sr1.valueOverview,sr1.fundingOverviewStartDate,sr1.fundingOverviewEndDate,sr1.aimsOverview,sr1.grantNumberOverview,sr1.worktribeNumberOverview) from ProjectCreate sp JOIN sp.fundingOverviewRows sr1 WHERE sp.id in (?1)")
    List<FundingOverviewRowsByID> findFundingOverviewRows(Long id);
}
