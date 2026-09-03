package com.star_track.star_track.starTrack.registration.service;

import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import com.star_track.star_track.starTrack.registration.dto.SignUpRequest;
import com.star_track.star_track.starTrack.registration.exception.UserAlreadyExistAuthenticationException;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;

import java.util.Map;
import java.util.Optional;

/**
 * @author zaheer
 * Define all the interfaces for registration purposes
 */
public interface UserService {

    public User registerNewUser(SignUpRequest signUpRequest) throws UserAlreadyExistAuthenticationException;

    User findUserByEmail(String email);

    Optional<User> findUserById(Long id);

    LocalUser processUserRegistration(String registrationId, Map<String, Object> attributes, OidcIdToken idToken, OidcUserInfo userInfo);
}