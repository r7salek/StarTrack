package com.star_track.star_track;

import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.registration.config.WebConfig;
import com.star_track.star_track.starTrack.registration.config.WebSecurityConfig;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import com.star_track.star_track.starTrack.registration.security.jwt.TokenProvider;
import com.star_track.star_track.starTrack.registration.security.oauth2.*;
import com.star_track.star_track.starTrack.registration.service.LocalUserDetailService;
import com.star_track.star_track.starTrack.repo.RoleRepo;
import com.star_track.star_track.starTrack.resource.UserResource;
import com.star_track.star_track.starTrack.resource.RoleResource;
import com.star_track.star_track.starTrack.resource.ProjectCreateResource;
import com.star_track.star_track.starTrack.service.UserService;
import com.star_track.star_track.starTrack.service.RoleService;
import com.star_track.star_track.starTrack.service.ProjectCreateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;

import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Exercises the real production filter chain and token parser, not a substitute security configuration. */
@WebMvcTest({UserResource.class, RoleResource.class, ProjectCreateResource.class})
@ContextConfiguration(classes = {UserResource.class, RoleResource.class, ProjectCreateResource.class,
        WebConfig.class, WebSecurityConfig.class, PropertyPlaceholderAutoConfiguration.class,
        ProductionSecurityTests.TokenConfiguration.class})
@TestPropertySource(properties = {"startrack.oauth.enabled=false", "startrack.cors.allowed-origins=http://127.0.0.1:4200"})
class ProductionSecurityTests {
    @Autowired private MockMvc mvc;
    @Autowired private Environment environment;
    @Autowired @Qualifier("corsConfigurationSource") private CorsConfigurationSource corsSource;
    @MockBean private UserService users;
    @MockBean private RoleService roles;
    @MockBean private RoleRepo roleRepo;
    @MockBean private ProjectCreateService projects;
    @MockBean private LocalUserDetailService details;
    @MockBean private CustomOAuth2UserService oauth;
    @MockBean private CustomOidcUserService oidc;
    @MockBean private OAuth2AuthenticationSuccessHandler success;
    @MockBean private OAuth2AuthenticationFailureHandler failure;

    private static final String BEARER = "Bearer " + TokenProviderCompatibilityTests.LEGACY_TOKEN;

    @BeforeEach
    void enabledAccount() {
        when(details.loadUserById(7L)).thenReturn(principal(true, "ROLE_USER"));
    }

    @Test
    void anonymousAndMalformedBearerRequestsAreUnauthorized() throws Exception {
        mvc.perform(get("/sybeUser/all")).andExpect(status().isUnauthorized());
        mvc.perform(get("/sybeUser/7").header("Authorization", "Bearer invalid")).andExpect(status().isUnauthorized());
        verifyNoInteractions(users);
    }

    @Test
    void bearerUserCanReadOwnProfileButNotOtherAccountsOrAdminRoutes() throws Exception {
        when(users.findUserDataById(7L)).thenReturn(principal(true, "ROLE_USER").getUser());
        mvc.perform(get("/sybeUser/7").header("Authorization", BEARER))
                .andExpect(status().isOk()).andExpect(jsonPath("$", not(hasKey("password"))));
        mvc.perform(get("/sybeUser/8").header("Authorization", BEARER)).andExpect(status().isForbidden());
        mvc.perform(get("/sybeUser/all").header("Authorization", BEARER)).andExpect(status().isForbidden());
        mvc.perform(get("/role/all").header("Authorization", BEARER)).andExpect(status().isForbidden());
    }

    @Test
    void administratorBearerRetainsAccountOperationsWithoutCsrfCookie() throws Exception {
        when(details.loadUserById(7L)).thenReturn(principal(true, "ROLE_USER", "ROLE_ADMIN"));
        when(users.allUser()).thenReturn(Collections.singletonList(principal(true, "ROLE_USER").getUser()));
        mvc.perform(get("/sybeUser/all").header("Authorization", BEARER))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0]", not(hasKey("password"))));
        mvc.perform(put("/sybeUser/activate/user@startrack.test").header("Authorization", BEARER)).andExpect(status().isOk());
    }

    @Test
    void corsIsEnforcedByProductionFilterChain() throws Exception {
        MockHttpServletRequest preflight = new MockHttpServletRequest("OPTIONS", "/sybeUser/all");
        preflight.addHeader("Origin", "http://127.0.0.1:4200");
        preflight.addHeader("Access-Control-Request-Method", "GET");
        CorsConfiguration cors = corsSource.getCorsConfiguration(preflight);
        assertNotNull(cors, "Production CORS source must match the account API");
        assertEquals("http://127.0.0.1:4200", cors.checkOrigin("http://127.0.0.1:4200"),
                () -> "Configured origins=" + cors.getAllowedOrigins() + "; property="
                        + environment.getProperty("startrack.cors.allowed-origins"));
        assertNotNull(cors.checkHttpMethod(org.springframework.http.HttpMethod.GET));
        mvc.perform(options("/sybeUser/all").header("Origin", "http://127.0.0.1:4200")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:4200"));
        mvc.perform(options("/sybeUser/all").header("Origin", "https://unapproved.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden()).andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void disabledOauthCannotRedirectToExternalProvider() throws Exception {
        mvc.perform(get("/oauth2/authorization/google")).andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("Location"));
        verifyNoInteractions(oauth, oidc, success, failure);
    }

    @Test
    void authenticatedLegacyWritesAndRemovedResetRoutesKeep405And404() throws Exception {
        when(details.loadUserById(7L)).thenReturn(principal(true, "ROLE_USER", "ROLE_ADMIN"));
        for (String route : Arrays.asList("/sybeUser/delete/user@startrack.test", "/sybeUser/activate/user@startrack.test",
                "/sybeUser/roleUpdate/user@startrack.test/ROLE_USER", "/sybeUser/deleteRequest/user@startrack.test",
                "/projectCreate/delete/1", "/projectCreate/permUpdate/1/read")) {
            mvc.perform(get(route).header("Authorization", BEARER)).andExpect(status().isMethodNotAllowed());
        }
        mvc.perform(get("/sybeUser/resetPassword/user@startrack.test").header("Authorization", BEARER)).andExpect(status().isNotFound());
        mvc.perform(put("/sybeUser/resetPassword/user@startrack.test").header("Authorization", BEARER)).andExpect(status().isNotFound());
    }

    @Test
    void deactivatedAccountCannotReusePreviouslyIssuedBearerToken() throws Exception {
        when(details.loadUserById(7L)).thenReturn(principal(false, "ROLE_USER"));
        mvc.perform(get("/sybeUser/7").header("Authorization", BEARER)).andExpect(status().isUnauthorized());
        verifyNoInteractions(users);
    }

    private static LocalUser principal(boolean enabled, String... authorities) {
        User user = new User();
        user.setId(7L);
        user.setEmail("user@startrack.test");
        user.setFirstName("Synthetic");
        user.setLastName("User");
        user.setPassword("synthetic-password-hash");
        user.setEnabled(enabled);
        return new LocalUser(user.getEmail(), user.getFirstName(), user.getLastName(), user.getPassword(),
                enabled, false, true, true, true,
                Arrays.stream(authorities).map(SimpleGrantedAuthority::new).collect(Collectors.toList()), user);
    }

    @TestConfiguration
    static class TokenConfiguration {
        @Bean TokenProvider tokenProvider() { return TokenProviderCompatibilityTests.provider(); }
    }
}
