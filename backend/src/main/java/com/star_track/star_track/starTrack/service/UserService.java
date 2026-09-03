/**
 * UserService
 * Provides business logic for managing users and their roles.
 * Handles CRUD operations, role updates, password resets, and more.
 */

package com.star_track.star_track.starTrack.service;

import com.star_track.star_track.starTrack.dto.UserManagementResponse;
import com.star_track.star_track.starTrack.dto.UserPasswordResponse;
import com.star_track.star_track.starTrack.exception.ApiRequestException;
import com.star_track.star_track.starTrack.model.Role;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.repo.RoleRepo;
import com.star_track.star_track.starTrack.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
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
                .orElseThrow(() -> new ApiRequestException("User by id " + id + " was not found"));
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
     * Delete a user by email.
     *
     * @param email The email of the user to delete.
     * @return Null after deletion.
     */
    public User deleteUser(String email) {
        User user = userRepo.findByEmail(email);
        userRepo.deleteById(user.getId());
        return null;
    }

    /**
     * Activate a user by email.
     *
     * @param email The email of the user to activate.
     * @return The updated user with enabled status set to true.
     */
    public User activateUser(String email) {
        User user = userRepo.findByEmail(email);
        user.setEnabled(true);
        user.setModifiedDate(new Date());
        return userRepo.save(user);
    }

    /**
     * Reset a user's password.
     *
     * @param email The email of the user.
     * @return The updated user with the reset password.
     */
    public User resetPassword(String email) {
        User user = userRepo.findByEmail(email);
        user.setPassword(passwordEncoder.encode("123456")); // Default reset password
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
        User user = userRepo.findByEmail(email);
        if (user != null) {
            user.setModifiedDate(new Date());
            HashSet<Role> userRoles = new HashSet<>();

            // Assign roles
            for (String roleName : roles) {
                Role role = roleRepository.findByName(roleName);
                userRoles.add(role);
            }
            user.setRoles(userRoles);
            return userRepo.save(user);
        } else {
            throw new ApiRequestException("User not found with email: " + email);
        }
    }

    /**
     * Update a user's profile.
     *
     * @param id   The ID of the user.
     * @param user A `UserManagementResponse` object with updated details.
     * @return The updated user.
     */
    public User updateUserProfile(Long id, UserManagementResponse user) {
        User existingUser = userRepo.getById(id);
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
        User existingUser = userRepo.getById(id);
        existingUser.setModifiedDate(new Date());
        existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(existingUser);
    }

    /**
     * Submit a delete request for a user.
     *
     * @param email The email of the user.
     * @return The updated user with the delete request marked.
     */
    public User deleteUserRequest(String email) {
        User user = userRepo.findByEmail(email);
        user.setDelete(true);
        user.setModifiedDate(new Date());
        return userRepo.save(user);
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
