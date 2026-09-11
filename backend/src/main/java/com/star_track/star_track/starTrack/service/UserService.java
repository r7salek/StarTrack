/**
 * UserService
 * Provides business logic for managing users and their roles.
 * Handles CRUD operations, role updates, password changes, and more.
 */

package com.star_track.star_track.starTrack.service;

import com.star_track.star_track.starTrack.dto.UserManagementResponse;
import com.star_track.star_track.starTrack.dto.UserPasswordResponse;
import com.star_track.star_track.starTrack.exception.ApiRequestException;
import com.star_track.star_track.starTrack.model.Role;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.repo.RoleRepo;
import com.star_track.star_track.starTrack.repo.UserRepo;
import com.star_track.star_track.starTrack.registration.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.util.*;

@Service
@Transactional
public class UserService {
    private final UserRepo userRepo; // Repository for user operations
    private final RoleRepo roleRepository; // Repository for role operations

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepo userRepo, RoleRepo roleRepository) {
        this.userRepo = userRepo;
        this.roleRepository = roleRepository;
    }

    /**
     * Find user by ID.
     *
     * @param id The ID of the user.
     * @return The user object if found, otherwise throws an exception.
     */
    public User findUserDataById(Long id) {
        return userRepo.findDataById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    /**
     * Retrieve all users.
     *
     * @return List of all users.
     */
    public List<User> allUser() {
        return userRepo.allUser();
    }

    /**
     * Deactivate a user while retaining permanent identity and historical attribution.
     *
     * @param email The email of the user to deactivate.
     * @return Null to preserve the legacy empty success response.
     */
    public User deleteUser(String email) {
        User user = requireUserByEmail(email);
        user.setEnabled(false);
        user.setDelete(true);
        user.setModifiedDate(new Date());
        userRepo.save(user);
        return null;
    }

    /**
     * Activate a user by email.
     *
     * @param email The email of the user to activate.
     * @return The updated user with enabled status set to true.
     */
    public User activateUser(String email) {
        User user = requireUserByEmail(email);
        user.setEnabled(true);
        user.setModifiedDate(new Date());
        return userRepo.save(user);
    }

    /**
     * Update user roles.
     *
     * @param email The email of the user.
     * @param roles List of role names to assign.
     * @return The updated user with new roles.
     */
    public User updateUserRole(String email, ArrayList<String> roles) {
        User user = requireUserByEmail(email);
        if (roles == null || roles.isEmpty()) {
            throw new ApiRequestException("A valid role is required");
        }
        HashSet<Role> userRoles = new HashSet<>();
        // Resolve every role before changing any managed account field.
        for (String roleName : roles) {
            Role role = roleName == null ? null : roleRepository.findByName(roleName);
            if (role == null) throw new ApiRequestException("Unknown role");
            userRoles.add(role);
        }
        user.setModifiedDate(new Date());
        user.setRoles(userRoles);
        return userRepo.save(user);
    }

    /**
     * Update a user's profile.
     *
     * @param id   The ID of the user.
     * @param user A `UserManagementResponse` object with updated details.
     * @return The updated user.
     */
    public User updateUserProfile(Long id, UserManagementResponse user) {
        User existingUser = findUserDataById(id);
        existingUser.setModifiedDate(new Date());
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setEmail(user.getEmail());
        return userRepo.save(existingUser);
    }

    /**
     * Update a user's password.
     *
     * @param id   The ID of the user.
     * @param user A `UserPasswordResponse` object containing the new password.
     * @return The updated user with the new password.
     */
    public User updateUserPassword(Long id, UserPasswordResponse user) {
        User existingUser = findUserDataById(id);
        existingUser.setModifiedDate(new Date());
        existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(existingUser);
    }

    /**
     * Submit a delete request for a user.
     *
     * @param id The authenticated user's immutable ID.
     * @return The updated user with the delete request marked.
     */
    public User deleteUserRequest(Long id) {
        User user = findUserDataById(id);
        user.setDelete(true);
        user.setModifiedDate(new Date());
        return userRepo.save(user);
    }

    private User requireUserByEmail(String email) {
        return Optional.ofNullable(userRepo.findByEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    /**
     * Retrieve user management data with merged roles.
     *
     * @return List of `UserManagementResponse` with user details and roles.
     */
    public List<UserManagementResponse> getuserManagementData() {
        List<UserManagementResponse> userResponses = userRepo.userManagement();
        Map<Long, UserManagementResponse> userMap = new HashMap<>();

        // Merge roles for users with the same ID
        for (UserManagementResponse user : userResponses) {
            if (userMap.containsKey(user.getId())) {
                UserManagementResponse existingUser = userMap.get(user.getId());
                existingUser.setRole(existingUser.getRole() + ", " + user.getRole());
            } else {
                userMap.put(user.getId(), user);
            }
        }

        // Extract merged users from the map
        return new ArrayList<>(userMap.values());
    }
}
