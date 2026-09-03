/**
 * Service class for managing project creation data.
 * Provides business logic for extracting, adding, and modifying project data.
 */
package com.star_track.star_track.starTrack.service;

import com.star_track.star_track.starTrack.dto.*;
import com.star_track.star_track.starTrack.model.*;
import com.star_track.star_track.starTrack.repo.ProjectCreateRepo;
import com.star_track.star_track.starTrack.repo.UserRepo;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectCreateService {
    private final UserRepo userRepo; // Repository for project creation operations
    private final ProjectCreateRepo projectCreateRepo;

    public ProjectCreateService(UserRepo userRepo, ProjectCreateRepo projectCreateRepo) {
        this.userRepo = userRepo;
        this.projectCreateRepo = projectCreateRepo;
    }

    /**
     * Retrieve all project creation data for management.
     *
     * @return List of `ProjectDataResponse` containing detailed project information.
     */
    public List<ProjectDataResponse> getProjectCreateManagementData() {
        List<ProjectCreateResponse> projectCreateResponses = projectCreateRepo.getProjectCreateManagementData();
        return getProjectDataResponses(projectCreateResponses);
    }
    /**
     * Helper method to map `ProjectCreateResponse` objects to `ProjectDataResponse` objects.
     *
     * @param projectCreateResponses List of `ProjectCreateResponse` objects.
     * @return List of `ProjectDataResponse` objects.
     */
    private List<ProjectDataResponse> getProjectDataResponses(List<ProjectCreateResponse> projectCreateResponses) {
        if (projectCreateResponses == null || projectCreateResponses.isEmpty()) {
            return new ArrayList<>(); // Return empty list if no data
        }
        // Map to ProjectDataResponse
        List<ProjectDataResponse> projectDataResponses = projectCreateResponses.stream().map(projectCreateResponse -> {
            ProjectDataResponse projectDataResponse = new ProjectDataResponse();

            // Map fields from ProjectCreateResponse to ProjectDataResponse
            projectDataResponse.setId(projectCreateResponse.getId());
            projectDataResponse.setProjectName(projectCreateResponse.getProjectName());
            projectDataResponse.setLastNamePI(projectCreateResponse.getLastNamePI());
            projectDataResponse.setFirstNamePI(projectCreateResponse.getFirstNamePI());
            projectDataResponse.setEmailPI(projectCreateResponse.getEmailPI());
            projectDataResponse.setDepartmentPI(projectCreateResponse.getDepartmentPI());
            projectDataResponse.setCrsidPI(projectCreateResponse.getCrsidPI());
            projectDataResponse.setOtherInforPI(projectCreateResponse.getOtherInforPI());
            projectDataResponse.setTtoContractName(projectCreateResponse.getTtoContractName());
            projectDataResponse.setTtoContractEmail(projectCreateResponse.getTtoContractEmail());
            projectDataResponse.setTtoContractOtherInfo(projectCreateResponse.getTtoContractOtherInfo());
            projectDataResponse.setModality(projectCreateResponse.getModality());
            projectDataResponse.setModalityOther(projectCreateResponse.getModalityOther());
            projectDataResponse.setAreaOfExpertise(projectCreateResponse.getAreaOfExpertise());
            projectDataResponse.setAreaOfExpertiseOther(projectCreateResponse.getAreaOfExpertiseOther());
            projectDataResponse.setReadiness(projectCreateResponse.getReadiness());
            projectDataResponse.setProjectBackground(projectCreateResponse.getProjectBackground());
            projectDataResponse.setBriefDescription(projectCreateResponse.getBriefDescription());
            projectDataResponse.setCreatedEmail(projectCreateResponse.getCreatedEmail());
            projectDataResponse.setCreatedDate(projectCreateResponse.getCreatedDate());
            projectDataResponse.setModifyEmail(projectCreateResponse.getModifyEmail());
            projectDataResponse.setApplyValue(projectCreateResponse.getApplyValue());

            if(projectCreateResponse.getId()!=null ){
                // Fetch FundingOverviewRowsByID for the current project ID
                List<FundingOverviewRowsByID> fundingOverviewRows = projectCreateRepo.findFundingOverviewRows(projectCreateResponse.getId());

                if (fundingOverviewRows != null && !fundingOverviewRows.isEmpty()) {


                    // Sort and pick the first row
                    FundingOverviewRowsByID topFundingOverview = fundingOverviewRows.stream()
                            .findFirst()
                            .orElse(null);
                 if (topFundingOverview != null) {
                    // Map fields from FundingOverviewRowsByID to ProjectDataResponse
                    projectDataResponse.setFundingOverview(topFundingOverview.getFundingOverview());
                    projectDataResponse.setFundingOverviewOther(topFundingOverview.getFundingOverviewOther());
                    projectDataResponse.setSchemeOverview(topFundingOverview.getSchemeOverview());
                    projectDataResponse.setValueOverview(topFundingOverview.getValueOverview());
                    projectDataResponse.setFundingOverviewStartDate(topFundingOverview.getFundingOverviewStartDate());
                    projectDataResponse.setFundingOverviewEndDate(topFundingOverview.getFundingOverviewEndDate());
                    projectDataResponse.setGrantNumberOverview(topFundingOverview.getGrantNumberOverview());
                    projectDataResponse.setWorktribeNumberOverview(topFundingOverview.getWorktribeNumberOverview());
                }
                }
            }


            return projectDataResponse;
        }).collect(Collectors.toList());
        return projectDataResponses;
    }


    /**
     * Retrieve the latest project creation data.
     *
     * @return List of `ProjectDataResponse` containing the latest project information.
     */
    public List<ProjectDataResponse> getProjectCreateManagementDataLatest() {
        List<ProjectCreateResponse> projectCreateResponses = projectCreateRepo.getProjectCreateManagementDataLatest();
        return getProjectDataResponses(projectCreateResponses);
    }

    /**
     * Add a new project to the project creation data.
     *
     * @param email The email of the user creating the project.
     * @param dto   The project data transfer object containing project details.
     * @return The created `ProjectCreate` object.
     */
    public ProjectCreate AddToProjectCreate(String email, ProjectCreateDTO dto) {
        ProjectCreate entity = new ProjectCreate();
        entity.setCreatedDate(new Date());
        entity.setProjectName(dto.getProjectName());
        entity.setLastNamePI(dto.getLastNamePI());
        entity.setFirstNamePI(dto.getFirstNamePI());
        entity.setEmailPI(dto.getEmailPI());
        entity.setDepartmentPI(dto.getDepartmentPI());
        entity.setCrsidPI(dto.getCrsidPI());
        entity.setOtherInforPI(dto.getOtherInforPI());
        entity.setTtoContractName(dto.getTtoContractName());
        entity.setTtoContractEmail(dto.getTtoContractEmail());
        entity.setTtoContractOtherInfo(dto.getTtoContractOtherInfo());

        // Get data for output
        final HashSet<SubContractorsRows> subContractorsRows = new HashSet<SubContractorsRows>();
        for (SubContractorsRowsResponse val : dto.getSubContractorsRows()) {
            SubContractorsRows sr = new SubContractorsRows();
            sr.setSubContractorsName(val.getSubContractorsName());
            sr.setSubContractorsEmail(val.getSubContractorsEmail());
            sr.setSubContractorsExpertise(val.getSubContractorsExpertise());
            sr.setSubContractorsOrganisation(val.getSubContractorsOrganisation());
            sr.setSubContractorsOtherInfo(val.getSubContractorsOtherInfo());
            subContractorsRows.add(sr);
        }
        entity.setModality(String.valueOf(dto.getModality()));
        entity.setModalityOther(dto.getModalityOther());
        entity.setAreaOfExpertise(String.valueOf(dto.getAreaOfExpertise()));
        entity.setAreaOfExpertiseOther(dto.getAreaOfExpertiseOther());
        entity.setReadiness(dto.getReadiness());
        entity.setProjectBackground(dto.getProjectBackground());
        entity.setBriefDescription(dto.getBriefDescription());
        entity.setApplyValue(ProjectCreate.SUBMITTED);

        // Get data for output
        final HashSet<GroupMemberRows> groupMemberRows = new HashSet<GroupMemberRows>();
        for (GroupMemberRowsResponse val : dto.getGroupMemberRows()) {
            GroupMemberRows sr = new GroupMemberRows();
            sr.setLastNamePostDoc(val.getLastNamePostDoc());
            sr.setFirstNamePostDoc(val.getFirstNamePostDoc());
            sr.setEmailPostDoc(val.getEmailPostDoc());
            sr.setDepartmentPostDoc(val.getDepartmentPostDoc());
            sr.setPositionPostDoc(val.getPositionPostDoc());
            sr.setCrsidPostDoc(val.getCrsidPostDoc());
            sr.setOtherInforPostDoc(val.getOtherInforPostDoc());
            groupMemberRows.add(sr);
        }
        // Get data for output
        final HashSet<OutputRows> outputRows = new HashSet<OutputRows>();
        for (OutputRowsResponse val : dto.getOutputRows()) {
            OutputRows sr = new OutputRows();
            sr.setOutput(val.getOutput());
            sr.setConfirmation(val.getConfirmation());
            sr.setOutputQuantity(val.getOutputQuantity());
            sr.setOutput_description(val.getOutput_description());
            outputRows.add(sr);
        }
    // Get data for collaborations
        final HashSet<CollaborationRows> collaborationRows = new HashSet<CollaborationRows>();
        for (CollaborationRowsResponse val : dto.getCollaborationRows()) {
            CollaborationRows sr1 = new CollaborationRows();
            sr1.setCollaboration(val.getCollaboration());
            sr1.setCollaborationName(val.getCollaborationName());
            sr1.setCollaborationEmail(val.getCollaborationEmail());
            sr1.setCollaborationLocation(val.getCollaborationLocation());
            sr1.setCollaborationOtherInfo(val.getCollaborationOtherInfo());
            collaborationRows.add(sr1);
        }
    // Get data for external adviser
        final HashSet<ExternalAdvisorsRows> externalAdvisorsRows = new HashSet<ExternalAdvisorsRows>();
        for (ExternalAdvisorsRowsResponse val : dto.getExternalAdvisorsRows()) {
            ExternalAdvisorsRows exa = new ExternalAdvisorsRows();
            exa.setExternalAdvisorsMeeting(val.getExternalAdvisorsMeeting());
            exa.setExternalAdvisorsOrganisation(val.getExternalAdvisorsOrganisation());
            exa.setExternalAdvisorsName(val.getExternalAdvisorsName());
            exa.setExternalAdvisorsEmail(val.getExternalAdvisorsEmail());
            exa.setExternalAdvisorsOutcome(val.getExternalAdvisorsOutcome());
            exa.setExternalAdvisorsExpertise(val.getExternalAdvisorsExpertise());
            externalAdvisorsRows.add(exa);
        }

        // Get data for PPI
        final HashSet<PpiRows> ppiRows = new HashSet<PpiRows>();
        for (PpiRowsResponse val : dto.getPpiRows()) {
            PpiRows exa = new PpiRows();
            exa.setPpiMeeting(val.getPpiMeeting());
            exa.setPpiContact(val.getPpiContact());
            exa.setPpiGroup(val.getPpiGroup());
            exa.setPpiOutcome(val.getPpiOutcome());
            ppiRows.add(exa);
        }

        // Get data for funding
        final HashSet<FundingRows> fundingRows = new HashSet<FundingRows>();
        for (FundingRowsResponse val : dto.getFundingRows()) {
            FundingRows fund = new FundingRows();
            fund.setFunding(String.valueOf(val.getFunding()));
            fund.setFundingOther(val.getFundingOther());
            fund.setFundingNIHR(val.getFundingNIHR());
            fund.setFundingNIHROther(val.getFundingNIHROther());
            fund.setFundingUKRIMRC(val.getFundingUKRIMRC());
            fund.setFundingUKRIMRCOther(val.getFundingUKRIMRCOther());
            fund.setFundingWellcomeTrust(val.getFundingWellcomeTrust());
            fund.setFundingWellcomeTrustOther(val.getFundingWellcomeTrustOther());
            fund.setScheme(val.getScheme());
            fund.setSchemeOther(val.getSchemeOther());
            fund.setValue(val.getValue());
            fund.setFundingStartDate(val.getFundingStartDate());
            fund.setFundingEndDate(val.getFundingEndDate());
            fund.setAims(val.getAims());
            fund.setGrantNumber(val.getGrantNumber());
            fund.setWorktribeNumber(val.getWorktribeNumber());
            fundingRows.add(fund);
        }

        // Get data for funding overview
        final HashSet<FundingOverviewRows> fundingOverviewRows = new HashSet<FundingOverviewRows>();
        for (FundingOverviewRowsResponse val : dto.getFundingOverviewRows()) {
            FundingOverviewRows fund = new FundingOverviewRows();
            fund.setFundingOverview(String.valueOf(val.getFundingOverview()));
            fund.setFundingOverviewOther(val.getFundingOverviewOther());
            fund.setFundingOverviewNIHR(val.getFundingOverviewNIHR());
            fund.setFundingOverviewNIHROther(val.getFundingOverviewNIHROther());
            fund.setFundingOverviewUKRIMRC(val.getFundingOverviewUKRIMRC());
            fund.setFundingOverviewUKRIMRCOther(val.getFundingOverviewUKRIMRCOther());
            fund.setFundingOverviewWellcomeTrust(val.getFundingOverviewWellcomeTrust());
            fund.setFundingOverviewWellcomeTrustOther(val.getFundingOverviewWellcomeTrustOther());
            fund.setSchemeOverview(val.getSchemeOverview());
            fund.setSchemeOverviewOther(val.getSchemeOverviewOther());
            fund.setValueOverview(val.getValueOverview());
            fund.setFundingOverviewStartDate(val.getFundingOverviewStartDate());
            fund.setFundingOverviewEndDate(val.getFundingOverviewEndDate());
            fund.setAimsOverview(val.getAimsOverview());
            fund.setGrantNumberOverview(val.getGrantNumberOverview());
            fund.setWorktribeNumberOverview(val.getWorktribeNumberOverview());
            fundingOverviewRows.add(fund);
        }

        // Get data for PPI
        final HashSet<OtrRows> otrRows = new HashSet<OtrRows>();
        for (otrRowsResponse val : dto.getOtrRows()) {
            OtrRows exa = new OtrRows();
            exa.setOtrTeamMember(val.getOtrTeamMember());
            exa.setOtrRole(val.getOtrRole());
            exa.setOtrFunding(val.getOtrFunding());
            exa.setOtrDate(val.getOtrDate());
            exa.setOtrOtherInfo(val.getOtrOtherInfo());
            otrRows.add(exa);
        }

        entity.setGroupMemberRows(groupMemberRows);
        entity.setOutputRows(outputRows);
        entity.setCollaborationRows(collaborationRows);
        entity.setExternalAdvisorsRows(externalAdvisorsRows);
        entity.setSubContractorsRows(subContractorsRows);
        entity.setPpiRows(ppiRows);
        entity.setFundingRows(fundingRows);
        entity.setFundingOverviewRows(fundingOverviewRows);
        entity.setOtrRows(otrRows);

        projectCreateRepo.save(entity);

        return null;
    }
    /**
     * Delete a project by ID.
     *
     * @param id The ID of the project to delete.
     * @return Null after deletion.
     */
    public ProjectCreate deleteData(Long id) {
        projectCreateRepo.deleteById(id);
        return null;
    }

    /**
     * Retrieve the historical data for a specific project.
     *
     * @param data1 The project name or identifier.
     * @return List of `ProjectDataResponse` containing historical project information.
     */
    public List<ProjectDataResponse> getCreateProjectDataHistory(String data1) {
        List<ProjectCreateResponse> projectCreateResponses = projectCreateRepo.getCreateProjectDataHistory(data1);
        return getProjectDataResponses(projectCreateResponses);
    }
    /**
     * Retrieve group member rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `GroupMemberRowsResponse`.
     */
    public List<GroupMemberRowsResponse> getGroupMemberRowsData(Long id) {
        return projectCreateRepo.findGroupMemberRows(id);
    }
    /**
     * Retrieve output rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `OutputRowsResponse`.
     */
    public List<OutputRowsResponse> getOutputRowsData(Long id) {
        return projectCreateRepo.findOutputRows(id);
    }
    /**
     * Retrieve collaboration rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `CollaborationRowsResponse`.
     */
    public List<CollaborationRowsResponse> getCollaborationRowsData(Long id) {
        return projectCreateRepo.findCollaborationRows(id);
    }
    /**
     * Retrieve external advisors rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `ExternalAdvisorsRowsResponse`.
     */
    public List<ExternalAdvisorsRowsResponse> getExternalAdvisorsRowsData(Long id) {
        return projectCreateRepo.findExternalAdvisorsRows(id);
    }

    /**
     * Retrieve subcontractor rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `SubContractorsRowsResponse`.
     */
    public List<SubContractorsRowsResponse> getSubcontractorsRowsData(Long id) {
        return projectCreateRepo.findSubcontractorsRows(id);
    }

    /**
     * Retrieve PPI rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `PpiRowsResponse`.
     */
    public List<PpiRowsResponse> getPpiRowsData(Long id) {
        return projectCreateRepo.findPpiRows(id);
    }

    /**
     * Retrieve OTR rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `otrRowsResponse`.
     */
    public List<otrRowsResponse> getOTRRowsData(Long id) {
        return projectCreateRepo.findOTRRows(id);
    }
    /**
     * Retrieve funding rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `FundingRowsByID`.
     */
    public List<FundingRowsByID> getFundingRowsData(Long id) {
        return projectCreateRepo.findFundingRows(id);
    }
    /**
     * Retrieve funding overview rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `FundingOverviewRowsByID`.
     */
    public List<FundingOverviewRowsByID> getFundingOverviewRowsData(Long id) {
        return projectCreateRepo.findFundingOverviewRows(id);
    }
    /**
     * Update permissions for a specific project.
     *
     * @param id         The project ID.
     * @param applyValue The updated permission value.
     * @return The updated `ProjectCreate` object.
     */
    public ProjectCreate updateUserPerm(Long id, String applyValue) {
        ProjectCreate data = projectCreateRepo.getById(id);
        data.setApplyValue(applyValue);
        projectCreateRepo.save(data);
        return null;
    }
}
