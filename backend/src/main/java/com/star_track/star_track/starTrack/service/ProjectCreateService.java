/**
 * Service class for managing project creation data.
 * Provides business logic for extracting, adding, and modifying project data.
 */
package com.star_track.star_track.starTrack.service;

import com.star_track.star_track.starTrack.dto.*;
import com.star_track.star_track.starTrack.model.*;
import com.star_track.star_track.starTrack.repo.ProjectCreateRepo;
import com.star_track.star_track.starTrack.repo.UserRepo;
import com.star_track.star_track.starTrack.repo.ProjectRepo;
import com.star_track.star_track.starTrack.exception.ProjectConflictException;
import com.star_track.star_track.starTrack.exception.ApiRequestException;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import com.star_track.star_track.starTrack.registration.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.beans.BeanUtils;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.transaction.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectCreateService {
    private final UserRepo userRepo; // Repository for project creation operations
    private final ProjectCreateRepo projectCreateRepo;
    private final ProjectRepo projectRepo;

    public ProjectCreateService(UserRepo userRepo, ProjectCreateRepo projectCreateRepo, ProjectRepo projectRepo) {
        this.userRepo = userRepo;
        this.projectCreateRepo = projectCreateRepo;
        this.projectRepo = projectRepo;
    }

    /**
     * Retrieve all project creation data for management.
     *
     * @return List of `ProjectDataResponse` containing detailed project information.
     */
    public List<ProjectDataResponse> getProjectCreateManagementData() {
        return projectCreateRepo.findAllByOrderByCreatedDateDescIdDesc().stream()
                .map(this::summary).toList();
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
        return projectCreateRepo.findLatestActive().stream().map(this::summary).toList();
    }

    /**
     * Add a new project to the project creation data.
     *
     * @param email The email of the user creating the project.
     * @param dto   The project data transfer object containing project details.
     * @return The created `ProjectCreate` object.
     */
    public ProjectCreate AddToProjectCreate(String email, ProjectCreateDTO dto) {
        // Legacy URL email is not trusted attribution. Authentication supplies the account.
        if (dto.getId() == null) return create(dto);
        ProjectCreate previous = requireProject(dto.getId());
        return append(previous.getProjectId(), previous.getVersionNumber(), dto);
    }

    private ProjectCreate buildSnapshot(ProjectCreateDTO dto) {
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
        final Set<SubContractorsRows> subContractorsRows = newSnapshotRows();
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
        entity.setApplyValue(validStatus(dto.getApplyValue() == null ? ProjectCreate.SUBMITTED : dto.getApplyValue()));

        // Get data for output
        final Set<GroupMemberRows> groupMemberRows = newSnapshotRows();
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
        final Set<OutputRows> outputRows = newSnapshotRows();
        for (OutputRowsResponse val : dto.getOutputRows()) {
            OutputRows sr = new OutputRows();
            sr.setOutput(val.getOutput());
            sr.setConfirmation(val.getConfirmation());
            sr.setOutputQuantity(val.getOutputQuantity());
            sr.setOutput_description(val.getOutput_description());
            outputRows.add(sr);
        }
    // Get data for collaborations
        final Set<CollaborationRows> collaborationRows = newSnapshotRows();
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
        final Set<ExternalAdvisorsRows> externalAdvisorsRows = newSnapshotRows();
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
        final Set<PpiRows> ppiRows = newSnapshotRows();
        for (PpiRowsResponse val : dto.getPpiRows()) {
            PpiRows exa = new PpiRows();
            exa.setPpiMeeting(val.getPpiMeeting());
            exa.setPpiContact(val.getPpiContact());
            exa.setPpiGroup(val.getPpiGroup());
            exa.setPpiOutcome(val.getPpiOutcome());
            ppiRows.add(exa);
        }

        // Get data for funding
        final Set<FundingRows> fundingRows = newSnapshotRows();
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
        final Set<FundingOverviewRows> fundingOverviewRows = newSnapshotRows();
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
        final Set<OtrRows> otrRows = newSnapshotRows();
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

        return entity;
    }
    /**
     * Delete a project by ID.
     *
     * @param id The ID of the project to delete.
     * @return Null after deletion.
     */
    public ProjectCreate deleteData(Long id) {
        archive(requireProject(id).getProjectId());
        return null;
    }

    /**
     * Retrieve the historical data for a specific project.
     *
     * @param data1 The project name or identifier.
     * @return List of `ProjectDataResponse` containing historical project information.
     */
    public List<ProjectDataResponse> getCreateProjectDataHistory(String data1) {
        Set<UUID> roots = projectCreateRepo.findByProjectName(data1).stream()
                .map(ProjectCreate::getProjectId).collect(Collectors.toSet());
        if (roots.size() > 1) throw new ProjectConflictException();
        if (roots.isEmpty()) return List.of();
        return projectCreateRepo.findByProjectIdOrderByVersionNumberDesc(roots.iterator().next())
                .stream().skip(1).map(this::summary).toList();
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
        ProjectCreate previous = requireProject(id);
        Project root = lockProject(previous.getProjectId());
        requireCurrent(root, previous.getVersionNumber());
        ProjectCreate next = copySnapshot(previous);
        next.setApplyValue(validStatus(applyValue));
        return saveVersion(root, next, previous.getVersionNumber() + 1);
    }

    public ProjectCreate create(ProjectCreateDTO dto) {
        if (dto.getId() != null || dto.getExpectedVersion() != null) throw new ApiRequestException("New project cannot reference a version");
        User actor = actor();
        Project root = new Project();
        root.setId(UUID.randomUUID());
        root.setCreatedAt(new Date());
        root.setCreatedBy(actor.getId());
        projectRepo.saveAndFlush(root);
        return saveVersion(root, buildSnapshot(dto), 1);
    }

    public ProjectCreate append(UUID projectId, Integer expectedVersion, ProjectCreateDTO dto) {
        if (expectedVersion == null || expectedVersion < 1) throw new ApiRequestException("Expected version is required");
        Project root = lockProject(projectId);
        requireCurrent(root, expectedVersion);
        if (dto.getId() != null) {
            ProjectCreate supplied = requireProject(dto.getId());
            if (!projectId.equals(supplied.getProjectId()) || !expectedVersion.equals(supplied.getVersionNumber())) {
                throw new ProjectConflictException();
            }
        }
        ProjectCreate next = buildSnapshot(dto);
        if (dto.getApplyValue() == null) next.setApplyValue(latest(projectId).getApplyValue());
        return saveVersion(root, next, expectedVersion + 1);
    }

    public void archive(UUID projectId) {
        Project root = lockProject(projectId);
        if (!root.isArchived()) {
            root.setArchived(true);
            root.setArchivedAt(new Date());
            root.setArchivedBy(actor().getId());
            projectRepo.save(root);
        }
    }

    public ProjectVersionResponse current(UUID projectId) {
        requireRoot(projectId);
        return detail(latest(projectId));
    }

    public List<ProjectVersionResponse> versions(UUID projectId) {
        requireRoot(projectId);
        return projectCreateRepo.findByProjectIdOrderByVersionNumberDesc(projectId).stream().map(this::detail).toList();
    }

    public ProjectVersionResponse detail(ProjectCreate version) {
        ProjectVersionResponse result = new ProjectVersionResponse();
        BeanUtils.copyProperties(summary(version), result);
        Long id = version.getId();
        result.setGroupMemberRows(projectCreateRepo.findGroupMemberRows(id));
        result.setOutputRows(projectCreateRepo.findOutputRows(id));
        result.setCollaborationRows(projectCreateRepo.findCollaborationRows(id));
        result.setExternalAdvisorsRows(projectCreateRepo.findExternalAdvisorsRows(id));
        result.setSubContractorsRows(projectCreateRepo.findSubcontractorsRows(id));
        result.setPpiRows(projectCreateRepo.findPpiRows(id));
        result.setOtrRows(projectCreateRepo.findOTRRows(id));
        result.setFundingRows(projectCreateRepo.findFundingRows(id));
        result.setFundingOverviewRows(projectCreateRepo.findFundingOverviewRows(id));
        return result;
    }

    private ProjectDataResponse summary(ProjectCreate version) {
        ProjectDataResponse result = new ProjectDataResponse();
        BeanUtils.copyProperties(version, result);
        result.setVersionId(version.getId());
        result.setArchived(requireRoot(version.getProjectId()).isArchived());
        projectCreateRepo.findFundingOverviewRows(version.getId()).stream().findFirst().ifPresent(funding ->
                BeanUtils.copyProperties(funding, result, "id"));
        return result;
    }

    private ProjectCreate saveVersion(Project root, ProjectCreate next, int number) {
        User actor = actor();
        next.setProjectId(root.getId());
        next.setVersionNumber(number);
        next.setCreatedDate(new Date());
        // Each snapshot records who saved it. Root retains the original project creator.
        next.setCreatedBy(actor.getId());
        next.setModifiedBy(actor.getId());
        next.setCreatedEmail(actor.getEmail());
        next.setModifyEmail(actor.getEmail());
        return projectCreateRepo.saveAndFlush(next);
    }

    private void requireCurrent(Project root, Integer expectedVersion) {
        if (expectedVersion == null || expectedVersion == Integer.MAX_VALUE || root.isArchived()
                || !latest(root.getId()).getVersionNumber().equals(expectedVersion)) throw new ProjectConflictException();
    }

    private ProjectCreate latest(UUID id) {
        return projectCreateRepo.findFirstByProjectIdOrderByVersionNumberDesc(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }

    private Project requireRoot(UUID id) {
        return projectRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }

    private Project lockProject(UUID id) {
        return projectRepo.lockById(id).orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }

    private User actor() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof LocalUser principal)) {
            throw new InsufficientAuthenticationException("Authentication required");
        }
        User user = userRepo.findById(principal.getUser().getId())
                .orElseThrow(() -> new InsufficientAuthenticationException("Authentication required"));
        if (!user.isEnabled()) throw new InsufficientAuthenticationException("Authentication required");
        return user;
    }

    private String validStatus(String value) {
        if (!Set.of(ProjectCreate.SUBMITTED, ProjectCreate.ACCEPTED, ProjectCreate.REJECTED, ProjectCreate.CLOSED).contains(value)) {
            throw new ApiRequestException("Unknown project status");
        }
        return value;
    }

    private ProjectCreate copySnapshot(ProjectCreate previous) {
        ProjectCreate next = new ProjectCreate();
        BeanUtils.copyProperties(previous, next, "id", "projectId", "versionNumber", "createdDate",
                "createdBy", "modifiedBy", "createdEmail", "modifyEmail", "groupMemberRows", "outputRows",
                "collaborationRows", "externalAdvisorsRows", "subContractorsRows", "ppiRows", "otrRows", "fundingRows", "fundingOverviewRows");
        next.setGroupMemberRows(copyRows(previous.getGroupMemberRows(), GroupMemberRows::new));
        next.setOutputRows(copyRows(previous.getOutputRows(), OutputRows::new));
        next.setCollaborationRows(copyRows(previous.getCollaborationRows(), CollaborationRows::new));
        next.setExternalAdvisorsRows(copyRows(previous.getExternalAdvisorsRows(), ExternalAdvisorsRows::new));
        next.setSubContractorsRows(copyRows(previous.getSubContractorsRows(), SubContractorsRows::new));
        next.setPpiRows(copyRows(previous.getPpiRows(), PpiRows::new));
        next.setOtrRows(copyRows(previous.getOtrRows(), OtrRows::new));
        next.setFundingRows(copyRows(previous.getFundingRows(), FundingRows::new));
        next.setFundingOverviewRows(copyRows(previous.getFundingOverviewRows(), FundingOverviewRows::new));
        return next;
    }

    private <T> Set<T> copyRows(Set<T> rows, java.util.function.Supplier<T> factory) {
        Set<T> copies = newSnapshotRows();
        rows.forEach(row -> {
            T copy = factory.get();
            BeanUtils.copyProperties(row, copy, "id", "projectCreate");
            copies.add(copy);
        });
        return copies;
    }

    private <T> Set<T> newSnapshotRows() {
        // Distinct rows with identical content must survive before generated IDs exist.
        return Collections.newSetFromMap(new IdentityHashMap<>());
    }

    private ProjectCreate requireProject(Long id) {
        return projectCreateRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }
}
