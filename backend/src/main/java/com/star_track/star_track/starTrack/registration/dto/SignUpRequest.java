package com.star_track.star_track.starTrack.registration.dto;

import com.star_track.star_track.starTrack.registration.validator.PasswordMatches;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;

/**
 * @author Zaheer
 * All reqired information regarding the user registration
 */
@Data
@PasswordMatches
public class SignUpRequest {

    private Long userID;
    private String providerUserId;
    @NotEmpty
    private String firstName;

    @NotEmpty
    private String lastName;

    @NotEmpty
    private String email;
    private SocialProvider socialProvider;
    @Size(min = 6, message = "{Size.userDto.password}")
    private String password;

    @NotEmpty
    private String matchingPassword;

    public SignUpRequest(String providerUserId,String firstName, String lastName, String email, String password, SocialProvider socialProvider) {
        this.providerUserId=providerUserId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.socialProvider = socialProvider;
    }

    public static Builder getBuilder() {
        return new Builder();
    }

    public static class Builder {
        private String providerUserID;
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private SocialProvider socialProvider;
        public Builder addProviderUserID(final String userID) {
            this.providerUserID = userID;
            return this;
        }
        public Builder addEmail(final String email) {
            this.email = email;
            return this;
        }
        public Builder addFirstName(final String firstName) {
            this.firstName = firstName;
            return this;
        }

        public Builder addLastName(final String lastName) {
            this.lastName = lastName;
            return this;
        }
        public Builder addPassword(final String password) {
            this.password = password;
            return this;
        }
        public Builder addSocialProvider(final SocialProvider socialProvider) {
            this.socialProvider = socialProvider;
            return this;
        }
        public SignUpRequest build() {
            return new SignUpRequest(providerUserID,firstName, lastName, email, password,socialProvider);
        }
    }
}