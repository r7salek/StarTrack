/**
 * logic for validation of password
 * check password and confirmed password
 */
package com.star_track.star_track.starTrack.registration.validator;

import com.star_track.star_track.starTrack.registration.dto.SignUpRequest;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, SignUpRequest> {

    @Override
    public boolean isValid(final SignUpRequest user, final ConstraintValidatorContext context) {
        return user.getPassword().equals(user.getMatchingPassword());
    }
}