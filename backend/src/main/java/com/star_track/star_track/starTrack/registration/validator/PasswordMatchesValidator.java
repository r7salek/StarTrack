/**
 * logic for validation of password
 * check password and confirmed password
 */
package com.star_track.star_track.starTrack.registration.validator;

import com.star_track.star_track.starTrack.registration.dto.SignUpRequest;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, SignUpRequest> {

    @Override
    public boolean isValid(final SignUpRequest user, final ConstraintValidatorContext context) {
        // Required-field constraints report absent values; comparison must not throw.
        if (user == null || user.getPassword() == null) return true;
        if (user.getPassword().equals(user.getMatchingPassword())) return true;
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate("Passwords must match")
                .addPropertyNode("matchingPassword").addConstraintViolation();
        return false;
    }
}
