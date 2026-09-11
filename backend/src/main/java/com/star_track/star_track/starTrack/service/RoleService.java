/**
 * RoleService
 * Provides business logic for managing roles.
 * Handles role deletion and updates.
 */

package com.star_track.star_track.starTrack.service;

import com.star_track.star_track.starTrack.model.Role;
import com.star_track.star_track.starTrack.repo.RoleRepo;
import com.star_track.star_track.starTrack.exception.ApiRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class RoleService {
    private final RoleRepo roleRepository;

    @Autowired
    public RoleService(RoleRepo roleRepository) {
        this.roleRepository = roleRepository;
    }

    /**
     * Delete a specified role given its ID.
     *
     * @param id The ID of the role to be deleted.
     * @return ResponseEntity with appropriate status and message:
     *         - 200 (OK) if the role is deleted successfully.
     *         - 422 (Unprocessable Entity) if the role has associated users or if it doesn't exist.
     */
    public ResponseEntity<Object> deleteRole(Long id) {
        if (roleRepository.findById(id).isPresent()) {
            // Check if the role is associated with any users
            if (roleRepository.getOne(id).getUsers().size() == 0) {
                roleRepository.deleteById(id);
                if (roleRepository.findById(id).isPresent()) {
                    // Check if the deletion failed
                    throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY);
                } else {
                    // Deletion successful
                    return ResponseEntity.ok().body("Successfully deleted specified record");
                }
            } else {
                // Role has associated users
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY);
            }
        } else {
            // Role not found
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Update a specified role given its ID.
     *
     * @param id   The ID of the role to be updated.
     * @param role The new role data to update.
     * @return ResponseEntity with appropriate status and message:
     *         - 202 (Accepted) if the role is updated successfully.
     *         - 400 (Bad Request) if the update fails.
     *         - 422 (Unprocessable Entity) if the role doesn't exist.
     */
    public ResponseEntity<Object> updateRole(Long id, Role role) {
        if (role == null || role.getName() == null || role.getName().isBlank()) {
            throw new ApiRequestException("A role name is required");
        }
        if (roleRepository.findById(id).isPresent()) {
            // Retrieve the existing role
            Role existingRole = roleRepository.findById(id).get();
            // Update the role name
            existingRole.setName(role.getName());
            // Save the updated role
            Role savedRole = roleRepository.save(existingRole);
            if (roleRepository.findById(savedRole.getId()).isPresent()) {
                // Update successful
                return ResponseEntity.accepted().body("Role saved successfully");
            } else {
                // Update failed
                throw new ApiRequestException("Role update failed");
            }
        } else {
            // Role not found
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
}
