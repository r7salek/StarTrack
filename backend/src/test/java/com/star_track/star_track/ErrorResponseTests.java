package com.star_track.star_track;

import com.star_track.star_track.starTrack.exception.ApiExceptionHandler;
import com.star_track.star_track.starTrack.exception.ApiRequestException;
import com.star_track.star_track.starTrack.registration.config.WebConfig;
import com.star_track.star_track.starTrack.registration.config.WebSecurityConfig;
import com.star_track.star_track.starTrack.registration.exception.handler.RestResponseEntityExceptionHandler;
import com.star_track.star_track.starTrack.registration.security.oauth2.*;
import com.star_track.star_track.starTrack.registration.service.LocalUserDetailService;
import com.star_track.star_track.starTrack.resource.UserResource;
import com.star_track.star_track.starTrack.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({UserResource.class, ErrorResponseTests.ErrorProbe.class})
@ContextConfiguration(classes = {UserResource.class, ErrorResponseTests.ErrorProbe.class,
        WebConfig.class, WebSecurityConfig.class, PropertyPlaceholderAutoConfiguration.class,
        ProductionSecurityTests.TokenConfiguration.class, ApiExceptionHandler.class,
        RestResponseEntityExceptionHandler.class})
@TestPropertySource(properties = {"startrack.oauth.enabled=false", "startrack.cors.allowed-origins=http://127.0.0.1:4200"})
class ErrorResponseTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean UserService users;
    @MockitoBean LocalUserDetailService details;
    @MockitoBean CustomOAuth2UserService oauth;
    @MockitoBean CustomOidcUserService oidc;
    @MockitoBean OAuth2AuthenticationSuccessHandler success;
    @MockitoBean OAuth2AuthenticationFailureHandler failure;

    @Test
    void anonymousRequestHasSafe401AndServerGeneratedRequestId() throws Exception {
        MvcResult result = mvc.perform(get("/sybeUser/all").header("X-Request-ID", "client-controlled-secret"))
                .andExpect(status().isUnauthorized()).andReturn();
        assertEnvelope(result, "UNAUTHORIZED");
        assertNotEquals("client-controlled-secret", result.getResponse().getHeader("X-Request-ID"));
    }

    @Test
    void ordinaryAccountHasSafe403ForAdminRoute() throws Exception {
        assertEnvelope(mvc.perform(get("/sybeUser/all").with(user("synthetic").authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isForbidden()).andReturn(), "FORBIDDEN");
    }

    @Test
    void malformedJsonHasSafe400WithoutParserOrSecretDetails() throws Exception {
        assertEnvelope(mvc.perform(post("/error-probe/validate").with(user("synthetic"))
                        .contentType("application/json").content("{\"name\":secret-sentinel"))
                .andExpect(status().isBadRequest()).andReturn(), "BAD_REQUEST");
    }

    @Test
    void validationErrorsUseSafeFieldMessagesRatherThanValidatorText() throws Exception {
        MvcResult result = mvc.perform(post("/error-probe/validate").with(user("synthetic"))
                        .contentType("application/json").content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.name").isString()).andReturn();
        assertEnvelope(result, "BAD_REQUEST");
    }

    @Test
    void missingRouteAndResourceHaveSafe404() throws Exception {
        assertEnvelope(mvc.perform(get("/missing-route").with(user("synthetic")))
                .andExpect(status().isNotFound()).andReturn(), "NOT_FOUND");
        assertEnvelope(mvc.perform(get("/error-probe/not-found").with(user("synthetic")))
                .andExpect(status().isNotFound()).andReturn(), "NOT_FOUND");
    }

    @Test
    void wrongMethodHasSafe405AndPreservesAllowHeader() throws Exception {
        assertEnvelope(mvc.perform(get("/error-probe/validate").with(user("synthetic")))
                .andExpect(status().isMethodNotAllowed()).andExpect(header().string("Allow", "POST")).andReturn(), "METHOD_NOT_ALLOWED");
    }

    @Test
    void integrityConflictsHaveSafe409WithoutSqlOrConstraintNames() throws Exception {
        assertEnvelope(mvc.perform(get("/error-probe/conflict").with(user("synthetic")))
                .andExpect(status().isConflict()).andReturn(), "CONFLICT");
    }

    @Test
    void applicationValidationExceptionDoesNotSerializeThrowable() throws Exception {
        assertEnvelope(mvc.perform(get("/error-probe/bad-request").with(user("synthetic")))
                .andExpect(status().isBadRequest()).andReturn(), "BAD_REQUEST");
    }

    @Test
    void unexpectedFailureHasSafe500() throws Exception {
        assertEnvelope(mvc.perform(get("/error-probe/failure").with(user("synthetic")))
                .andExpect(status().isInternalServerError()).andReturn(), "INTERNAL_ERROR");
    }

    @Test
    void explicit422KeepsStatusAndSafeEnvelope() throws Exception {
        assertEnvelope(mvc.perform(get("/error-probe/unprocessable").with(user("synthetic")))
                .andExpect(status().isUnprocessableEntity()).andReturn(), "UNPROCESSABLE_ENTITY");
    }

    private void assertEnvelope(MvcResult result, String code) throws Exception {
        String body = result.getResponse().getContentAsString();
        JsonNode json = mapper.readTree(body);
        assertNotNull(json, "Error response must have a JSON body");
        Set<String> names = new HashSet<>(json.propertyNames());
        assertEquals(Set.of("success", "code", "message", "fieldErrors", "requestId"), names);
        assertFalse(json.get("success").asBoolean());
        assertEquals(code, json.get("code").asString());
        assertTrue(json.get("message").isString());
        assertTrue(json.get("fieldErrors").isObject());
        String requestId = json.get("requestId").asString();
        assertEquals(UUID.fromString(requestId).toString(), requestId);
        assertEquals(requestId, result.getResponse().getHeader("X-Request-ID"));
        for (String forbidden : new String[]{"secret-sentinel", "SELECT", "stackTrace", "throwable", "client-controlled-secret"}) {
            assertFalse(body.contains(forbidden), "Error payload exposed internal detail");
        }
    }

    @RestController
    static class ErrorProbe {
        @PostMapping("/error-probe/validate")
        void validate(@Valid @RequestBody ProbeBody body) {}
        @GetMapping("/error-probe/not-found")
        void missing() { throw new ResponseStatusException(HttpStatus.NOT_FOUND, "secret-sentinel"); }
        @GetMapping("/error-probe/conflict")
        void conflict() { throw new DataIntegrityViolationException("SELECT secret-sentinel"); }
        @GetMapping("/error-probe/bad-request")
        void badRequest() { throw new ApiRequestException("SELECT secret-sentinel"); }
        @GetMapping("/error-probe/failure")
        void failure() { throw new IllegalStateException("SELECT secret-sentinel"); }
        @GetMapping("/error-probe/unprocessable")
        void unprocessable() { throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "secret-sentinel"); }
    }

    static class ProbeBody {
        @NotBlank(message = "secret-sentinel")
        public String name;
    }
}
