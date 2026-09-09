package com.star_track.star_track;

import com.star_track.star_track.starTrack.exception.ApiExceptionHandler;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.registration.config.WebConfig;
import com.star_track.star_track.starTrack.registration.config.WebSecurityConfig;
import com.star_track.star_track.starTrack.registration.controller.AuthController;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import com.star_track.star_track.starTrack.registration.exception.UserAlreadyExistAuthenticationException;
import com.star_track.star_track.starTrack.registration.exception.handler.RestResponseEntityExceptionHandler;
import com.star_track.star_track.starTrack.registration.security.oauth2.*;
import com.star_track.star_track.starTrack.registration.service.LocalUserDetailService;
import com.star_track.star_track.starTrack.resource.ProjectCreateResource;
import com.star_track.star_track.starTrack.resource.UserResource;
import com.star_track.star_track.starTrack.service.ProjectCreateService;
import com.star_track.star_track.starTrack.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.util.List;
import java.util.stream.Stream;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({AuthController.class, UserResource.class, ProjectCreateResource.class})
@ContextConfiguration(classes = {AuthController.class, UserResource.class, ProjectCreateResource.class,
        WebConfig.class, WebSecurityConfig.class, PropertyPlaceholderAutoConfiguration.class,
        ProductionSecurityTests.TokenConfiguration.class, ApiExceptionHandler.class,
        RestResponseEntityExceptionHandler.class})
@TestPropertySource(properties = {"startrack.oauth.enabled=false", "startrack.cors.allowed-origins=http://127.0.0.1:4200"})
class ControllerInputTests {
    private static final String BEARER = "Bearer " + TokenProviderCompatibilityTests.LEGACY_TOKEN;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean UserService users;
    @MockitoBean ProjectCreateService projects;
    @MockitoBean com.star_track.star_track.starTrack.registration.service.UserService registrations;
    @MockitoBean LocalUserDetailService details;
    @MockitoBean CustomOAuth2UserService oauth;
    @MockitoBean CustomOidcUserService oidc;
    @MockitoBean OAuth2AuthenticationSuccessHandler success;
    @MockitoBean OAuth2AuthenticationFailureHandler failure;

    @BeforeEach void principal() {
        User user = new User();
        user.setId(7L);
        user.setEmail("user@startrack.test");
        when(details.loadUserById(7L)).thenReturn(new LocalUser("Synthetic", "User", user.getEmail(),
                "synthetic-hash", true, false, true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_USER")), user));
    }

    static Stream<String> childFields() { return InputValidationTests.childFields(); }

    @ParameterizedTest @MethodSource("childFields")
    void realProjectControllerRejectsOmittedNullAndNullElementArrays(String field) throws Exception {
        for (int mode = 0; mode < 3; mode++) {
            ObjectNode body = (ObjectNode) mapper.valueToTree(InputValidationTests.emptyProject());
            if (mode == 0) body.remove(field);
            else if (mode == 1) body.putNull(field);
            else body.putArray(field).addNull();
            mvc.perform(post("/projectCreate/addToProjectCreate/user@startrack.test").header("Authorization", BEARER)
                            .contentType("application/json").content(mapper.writeValueAsString(body)))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("BAD_REQUEST"))
                    .andExpect(header().exists("X-Request-ID"));
        }
        verifyNoInteractions(projects);
    }

    @Test void realProjectControllerStillAcceptsEmptyArrays() throws Exception {
        mvc.perform(post("/projectCreate/addToProjectCreate/user@startrack.test").header("Authorization", BEARER)
                        .contentType("application/json").content(mapper.writeValueAsString(InputValidationTests.emptyProject())))
                .andExpect(status().isOk());
        verify(projects).AddToProjectCreate(eq("user@startrack.test"), any());
    }

    @ParameterizedTest @NullAndEmptySource @ValueSource(strings = {"      ", "short"})
    void realPasswordAndSignupControllersRejectInvalidPasswords(String password) throws Exception {
        ObjectNode body = mapper.createObjectNode();
        body.put("password", password);
        mvc.perform(post("/sybeUser/passwordUpdate/7").header("Authorization", BEARER)
                        .contentType("application/json").content(mapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.password").isString());
        body.put("firstName", "Synthetic").put("lastName", "User").put("email", "new@startrack.test")
                .put("matchingPassword", password);
        mvc.perform(post("/api/auth/signup").contentType("application/json").content(mapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.password").isString());
        verifyNoInteractions(users, registrations);
    }

    @ParameterizedTest @ValueSource(booleans = {false, true})
    void duplicateSignupAndDatabaseRaceUseTheSameSafeConflict(boolean race) throws Exception {
        RuntimeException error = race ? new DataIntegrityViolationException("SELECT secret-sentinel")
                : new UserAlreadyExistAuthenticationException("secret-sentinel@startrack.test");
        doThrow(error).when(registrations).registerNewUser(any());
        mvc.perform(post("/api/auth/signup").contentType("application/json")
                        .content("{\"firstName\":\"Synthetic\",\"lastName\":\"User\",\"email\":\"new@startrack.test\","
                                + "\"password\":\"synthetic-password\",\"matchingPassword\":\"synthetic-password\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("CONFLICT"))
                .andExpect(content().string(not(containsString("secret-sentinel"))));
    }
}
