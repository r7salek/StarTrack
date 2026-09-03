/**
 * Mapping class for creating project data
 * REST APIs to extract data, add data, and modify data.
 */

package com.star_track.star_track.starTrack.resource;

import com.star_track.star_track.starTrack.dto.*;
import com.star_track.star_track.starTrack.model.ProjectCreate;
import com.star_track.star_track.starTrack.service.ProjectCreateService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*") // Allows cross-origin requests from any domain
@RestController
@RequestMapping("/projectCreate") // Base URL for project creation APIs
public class ProjectCreateResource {
    public final ProjectCreateService projectCreateService;

    public ProjectCreateResource(ProjectCreateService projectCreateService) {
        this.projectCreateService = projectCreateService;
    }

    /**
     * Retrieve all project creation data.
     *
     * @return List of all project creation data with HTTP status 200 (OK).
     */
    @GetMapping("/allData")
    public ResponseEntity<List> getProjectCreateManagementData() {
        List data = projectCreateService.getProjectCreateManagementData();
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    /**
     * Retrieve the latest project creation data.
     *
     * @return List of the latest project data with HTTP status 200 (OK).
     */
    @GetMapping("/allDatalatest")
    public ResponseEntity<List> getProjectCreateManagementDataLatest() {
        List data = projectCreateService.getProjectCreateManagementDataLatest();
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    /**
     * Add a new project to the project creation data.
     *
     * @param email   The email of the user adding the project.
     * @param project The project data to be added.
     * @return The created project data with HTTP status 200 (OK).
     */
    @PostMapping("/addToProjectCreate/{email}")
    public ResponseEntity<ProjectCreate> AddToProjectCreate(@PathVariable(value = "email") String email, @RequestBody(required = true) ProjectCreateDTO project) {
        ProjectCreate addData = projectCreateService.AddToProjectCreate(email, project);
        return new ResponseEntity<>(addData, HttpStatus.OK);
    }

    /**
     * Delete a project by ID.
     *
     * @param id The ID of the project to be deleted.
     * @return The deleted project data with HTTP status 200 (OK).
     */
    @RequestMapping(value = "/delete/{id}", method = {RequestMethod.DELETE, RequestMethod.GET})
    public ResponseEntity<ProjectCreate> deleteUser(@PathVariable("id") Long id) {
        ProjectCreate newData = projectCreateService.deleteData(id);
        return new ResponseEntity<>(newData, HttpStatus.OK);
    }

    /**
     * Retrieve project history data for a specific project.
     *
     * @param data1 The project name or identifier for which history is retrieved.
     * @return List of historical project data with HTTP status 200 (OK).
     */
    @GetMapping("/allDataHistroy/{data1}")
    public ResponseEntity<List> getCreateProjectDataHistory(@PathVariable(value = "data1") String data1) {
        List data = projectCreateService.getCreateProjectDataHistory(data1);
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    /**
     * Retrieve group member rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `GroupMemberRowsResponse` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allGroupMember/{id}")
    public ResponseEntity<List<GroupMemberRowsResponse>> getGroupMemberRowsData(@PathVariable("id") Long id) {
        List<GroupMemberRowsResponse> sybeUsers = projectCreateService.getGroupMemberRowsData(id);
        return new ResponseEntity<>(sybeUsers, HttpStatus.OK);
    }

    /**
     * Retrieve output rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `OutputRowsResponse` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allOutput/{id}")
    public ResponseEntity<List<OutputRowsResponse>> getOutputRowsData(@PathVariable("id") Long id) {
        List<OutputRowsResponse> sybeUsers = projectCreateService.getOutputRowsData(id);
        return new ResponseEntity<>(sybeUsers, HttpStatus.OK);
    }

    /**
     * Retrieve collaboration rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `CollaborationRowsResponse` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allCollaboration/{id}")
    public ResponseEntity<List<CollaborationRowsResponse>> getCollaborationRowsData(@PathVariable("id") Long id) {
        List<CollaborationRowsResponse> sybeUsers1 = projectCreateService.getCollaborationRowsData(id);
        return new ResponseEntity<>(sybeUsers1, HttpStatus.OK);
    }

    /**
     * Retrieve external advisor rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `ExternalAdvisorsRowsResponse` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allExternalAdvisor/{id}")
    public ResponseEntity<List<ExternalAdvisorsRowsResponse>> getExternalAdvisorsRowsData(@PathVariable("id") Long id) {
        List<ExternalAdvisorsRowsResponse> sybeUsers2 = projectCreateService.getExternalAdvisorsRowsData(id);
        return new ResponseEntity<>(sybeUsers2, HttpStatus.OK);
    }

    /**
     * Retrieve subcontractor rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `SubContractorsRowsResponse` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allSubcontractor/{id}")
    public ResponseEntity<List<SubContractorsRowsResponse>> getSubcontractorsRowsData(@PathVariable("id") Long id) {
        List<SubContractorsRowsResponse> sybeUsers2 = projectCreateService.getSubcontractorsRowsData(id);
        return new ResponseEntity<>(sybeUsers2, HttpStatus.OK);
    }

    /**
     * Retrieve PPI rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `PpiRowsResponse` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allPPI/{id}")
    public ResponseEntity<List<PpiRowsResponse>> getPpiRowsData(@PathVariable("id") Long id) {
        List<PpiRowsResponse> sybeUsers2 = projectCreateService.getPpiRowsData(id);
        return new ResponseEntity<>(sybeUsers2, HttpStatus.OK);
    }

    /**
     * Retrieve OTR rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `otrRowsResponse` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allOTR/{id}")
    public ResponseEntity<List<otrRowsResponse>> getOTRRowsData(@PathVariable("id") Long id) {
        List<otrRowsResponse> sybeUsers2 = projectCreateService.getOTRRowsData(id);
        return new ResponseEntity<>(sybeUsers2, HttpStatus.OK);
    }

    /**
     * Retrieve funding rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `FundingRowsByID` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allFunding/{id}")
    public ResponseEntity<List<FundingRowsByID>> getFundingRowsData(@PathVariable("id") Long id) {
        List<FundingRowsByID> fund = projectCreateService.getFundingRowsData(id);
        return new ResponseEntity<>(fund, HttpStatus.OK);
    }

    /**
     * Retrieve funding overview rows for a specific project by ID.
     *
     * @param id The project ID.
     * @return List of `FundingOverviewRowsByID` objects with HTTP status 200 (OK).
     */
    @GetMapping("/allFundingOverview/{id}")
    public ResponseEntity<List<FundingOverviewRowsByID>> getFundingOverviewRowsData(@PathVariable("id") Long id) {
        List<FundingOverviewRowsByID> fund = projectCreateService.getFundingOverviewRowsData(id);
        return new ResponseEntity<>(fund, HttpStatus.OK);
    }

    /**
     * Update permissions for a project by ID.
     *
     * @param id         The project ID.
     * @param applyValue The permission value to update.
     * @return The updated project data with HTTP status 200 (OK).
     */
    @RequestMapping(value = "/permUpdate/{id}/{applyValue}", method = {RequestMethod.PUT, RequestMethod.GET})
    public ResponseEntity<Object> updateUser(@PathVariable(value = "id") Long id, @PathVariable(value = "applyValue") String applyValue) {
        ProjectCreate updateUser = projectCreateService.updateUserPerm(id, applyValue);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }
}
