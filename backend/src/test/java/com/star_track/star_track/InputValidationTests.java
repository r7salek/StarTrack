package com.star_track.star_track;

import com.star_track.star_track.starTrack.dto.ProjectCreateDTO;
import com.star_track.star_track.starTrack.dto.UserPasswordResponse;
import com.star_track.star_track.starTrack.registration.dto.SignUpRequest;
import com.star_track.star_track.starTrack.registration.validator.PasswordMatchesValidator;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class InputValidationTests {
    private static final List<String> CHILD_FIELDS = List.of("groupMemberRows", "subContractorsRows", "ppiRows",
            "outputRows", "collaborationRows", "externalAdvisorsRows", "fundingRows", "fundingOverviewRows", "otrRows");
    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll static void setup() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll static void close() { factory.close(); }
    static Stream<String> childFields() { return CHILD_FIELDS.stream(); }

    static ProjectCreateDTO emptyProject() throws Exception {
        ProjectCreateDTO dto = new ProjectCreateDTO();
        for (String field : CHILD_FIELDS) set(dto, field, List.of());
        return dto;
    }

    private static void set(ProjectCreateDTO dto, String name, Object value) throws Exception {
        var field = ProjectCreateDTO.class.getDeclaredField(name);
        field.setAccessible(true);
        field.set(dto, value);
    }

    @Test void emptyChildArraysRemainValid() throws Exception {
        assertTrue(validator.validate(emptyProject()).isEmpty());
    }

    @ParameterizedTest @MethodSource("childFields")
    void missingOrNullChildArrayIsRejected(String field) throws Exception {
        var dto = emptyProject();
        set(dto, field, null);
        assertTrue(validator.validate(dto).stream().anyMatch(v -> v.getPropertyPath().toString().equals(field)), field);
    }

    @ParameterizedTest @MethodSource("childFields")
    void nullChildElementIsRejected(String field) throws Exception {
        var dto = emptyProject();
        set(dto, field, Collections.singletonList(null));
        assertTrue(validator.validate(dto).stream().anyMatch(v -> v.getPropertyPath().toString().startsWith(field)), field);
    }

    private static SignUpRequest signup(String password) {
        SignUpRequest request = new SignUpRequest();
        request.setFirstName("Synthetic");
        request.setLastName("User");
        request.setEmail("synthetic@startrack.test");
        request.setPassword(password);
        request.setMatchingPassword(password);
        return request;
    }

    @ParameterizedTest @NullAndEmptySource @ValueSource(strings = {"      ", "short"})
    void signupRejectsMissingBlankAndShortPasswordsWithoutThrowing(String password) {
        var violations = assertDoesNotThrow(() -> validator.validate(signup(password)));
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @ParameterizedTest @NullAndEmptySource @ValueSource(strings = {"      ", "short"})
    void passwordChangesUseTheSameMinimumPolicy(String password) {
        assertFalse(validator.validate(new UserPasswordResponse(password)).isEmpty());
    }

    @Test void validSixCharacterPasswordsRemainAccepted() {
        assertTrue(validator.validate(signup("abc123")).isEmpty());
        assertTrue(validator.validate(new UserPasswordResponse("abc123")).isEmpty());
    }

    @Test void mismatchIsAssociatedWithTheConfirmationField() {
        var request = signup("synthetic-password");
        request.setMatchingPassword("different-password");
        assertTrue(validator.validate(request).stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("matchingPassword")));
    }

    @Test void missingBeanDoesNotCrashThePasswordComparisonValidator() {
        assertTrue(new PasswordMatchesValidator().isValid(null, null));
    }
}
