/**
 * UserResource Controller
 * Exposes RESTful APIs for managing user-related operations.
 * Handles user CRUD operations, role updates, profile updates, and more.
 */

package com.star_track.star_track.starTrack.resource;

import com.star_track.star_track.starTrack.dto.UserManagementResponse;
import com.star_track.star_track.starTrack.dto.UserPasswordResponse;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*") // Allows cross-origin requests from any domain
@RestController
@RequestMapping("/sybeUser") // Base URL for user-related APIs
public class UserResource {
    private final UserService userService;

    public UserResource(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieve all users.
     *
     * @return A list of all users with HTTP status 200 (OK).
     */
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllDataInterceptor() {
        try {
            List<User> sybeUsers = userService.allUser();
            return new ResponseEntity<>(sybeUsers, HttpStatus.OK);
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Retrieve user details by ID.
     *
     * @param id The ID of the user.
     * @return The user details with HTTP status 200 (OK).
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getDataById(@PathVariable("id") Long id) {
        User sybeUsers = userService.findUserDataById(id);
        return new ResponseEntity<>(sybeUsers, HttpStatus.OK);
    }

    /**
     * Delete a user by email.
     *
     * @param email The email of the user to delete.
     * @return The deleted user details with HTTP status 200 (OK).
     */
    @RequestMapping(value = "/delete/{email}", method = {RequestMethod.DELETE, RequestMethod.GET})
    public ResponseEntity<User> deleteUser(@PathVariable("email") String email) {
        User sybeUsers = userService.deleteUser(email);
        return new ResponseEntity<>(sybeUsers, HttpStatus.OK);
    }

    /**
     * Activate a user by email.
     *
     * @param email The email of the user to activate.
     * @return The updated user details with HTTP status 200 (OK).
     */
    @RequestMapping(value = "/activate/{email}", method = {RequestMethod.PUT, RequestMethod.GET})
    public ResponseEntity<User> activateUser(@PathVariable(value = "email") String email) {
        User updateUser = userService.activateUser(email);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }

    /**
     * Reset a user's password by email.
     *
     * @param email The email of the user.
     * @return The user details after resetting the password with HTTP status 200 (OK).
     */
    @RequestMapping(value = "/resetPassword/{email}", method = {RequestMethod.PUT, RequestMethod.GET})
    public ResponseEntity<User> resetPassword(@PathVariable(value = "email") String email) {
        User updateUser = userService.resetPassword(email);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }

    /**
     * Update a user's role.
     *
     * @param email The email of the user.
     * @param role  A list of roles to assign.
     * @return The updated user details with HTTP status 200 (OK).
     */
    @RequestMapping(value = "/roleUpdate/{email}/{role}", method = {RequestMethod.PUT, RequestMethod.GET})
    public ResponseEntity<Object> updateUser(@PathVariable(value = "email") String email, @PathVariable(value = "role") ArrayList<String> role) {
        User updateUser = userService.updateUserRole(email, role);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }

    /**
     * Update a user's password.
     *
     * @param id   The ID of the user.
     * @param user A `UserPasswordResponse` object containing the new password.
     * @return The updated user details with HTTP status 200 (OK).
     */
    @PostMapping("/passwordUpdate/{id}")
    public ResponseEntity<User> updateUserPassword(@PathVariable(value = "id") Long id, @RequestBody(required = true) UserPasswordResponse user) {
        User updateEmployee = userService.updateUserPassword(id, user);
        return new ResponseEntity<>(updateEmployee, HttpStatus.OK);
    }

    /**
     * Update a user's profile.
     *
     * @param id   The ID of the user.
     * @param user A `UserManagementResponse` object containing updated user details.
     * @return The updated user details with HTTP status 200 (OK).
     */
    @PostMapping("/profileUpdate/{id}")
    public ResponseEntity<User> updateUserProfile(@PathVariable(value = "id") Long id, @RequestBody(required = true) UserManagementResponse user) {
        User updateEmployee = userService.updateUserProfile(id, user);
        return new ResponseEntity<>(updateEmployee, HttpStatus.OK);
    }

    /**
     * Submit a delete request for a user.
     *
     * @param email The email of the user to delete.
     * @return The updated user details after the delete request with HTTP status 200 (OK).
     */
    @RequestMapping(value = "/deleteRequest/{email}", method = {RequestMethod.PUT, RequestMethod.GET})
    public ResponseEntity<User> deleteUserRequest(@PathVariable(value = "email") String email) {
        User updateUser = userService.deleteUserRequest(email);
        return new ResponseEntity<>(updateUser, HttpStatus.OK);
    }

    /**
     * Retrieve user management data.
     *
     * @return A list of user management data with HTTP status 200 (OK).
     */
    @GetMapping("/userData")
    public ResponseEntity<List> getUserManagementData() {
        List sybeUsers = userService.getuserManagementData();
        return new ResponseEntity<>(sybeUsers, HttpStatus.OK);
    }
}
