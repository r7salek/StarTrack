/**
 * RoleResource Controller
 * Exposes RESTful APIs for managing user roles.
 * Handles role CRUD operations and provides details about roles.
 */

package com.star_track.star_track.starTrack.resource;

import com.star_track.star_track.starTrack.dto.TimeSlotData;
import com.star_track.star_track.starTrack.model.Role;
import com.star_track.star_track.starTrack.repo.RoleRepo;
import com.star_track.star_track.starTrack.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*") // Allows cross-origin requests from any domain
@RestController
@RequestMapping("/role") // Base URL for role-related APIs
public class RoleResource {
    private final RoleService roleService;
    private final RoleRepo roleRepository;

    public RoleResource(RoleService roleService, RoleRepo roleRepository) {
        this.roleService = roleService;
        this.roleRepository = roleRepository;
    }

    /**
     * Delete a role by ID.
     *
     * @param id The ID of the role to delete.
     * @return ResponseEntity with HTTP status indicating the result of the deletion.
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteRole(@PathVariable Long id) {
        return roleService.deleteRole(id);
    }

    /**
     * Retrieve details of a role by ID.
     *
     * @param id The ID of the role.
     * @return The `Role` object if found, or null if not present.
     */
    @GetMapping("/details/{id}")
    public Role getRole(@PathVariable Long id) {
        return roleRepository.findById(id).orElse(null);
    }

    /**
     * Retrieve all roles.
     *
     * @return A list of `TimeSlotData` objects representing all available roles.
     */
    @GetMapping("/all")
    public List<TimeSlotData> getRoles() {
        return roleRepository.findRoles();
    }

    /**
     * Update a role by ID.
     *
     * @param id   The ID of the role to update.
     * @param role A `Role` object containing updated role details.
     * @return ResponseEntity with HTTP status indicating the result of the update.
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateRole(@PathVariable Long id, @RequestBody Role role) {
        return roleService.updateRole(id, role);
    }
}
