package com.star_track.star_track;

import tools.jackson.databind.ObjectMapper;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.registration.config.WebConfig;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import com.star_track.star_track.starTrack.repo.RoleRepo;
import com.star_track.star_track.starTrack.resource.ProjectCreateResource;
import com.star_track.star_track.starTrack.resource.RoleResource;
import com.star_track.star_track.starTrack.resource.UserResource;
import com.star_track.star_track.starTrack.service.ProjectCreateService;
import com.star_track.star_track.starTrack.service.RoleService;
import com.star_track.star_track.starTrack.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import jakarta.annotation.Resource;
import java.util.Collections;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasKey;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({UserResource.class, RoleResource.class, ProjectCreateResource.class})
@ContextConfiguration(classes = {
        UserResource.class,
        RoleResource.class,
        ProjectCreateResource.class,
        WebConfig.class,
        AccountSecurityTests.TestSecurityConfiguration.class
})
@TestPropertySource(properties = "startrack.cors.allowed-origins=http://127.0.0.1:4200")
class AccountSecurityTests {

    @Resource
    private MockMvc mockMvc;

    @Resource
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private RoleService roleService;

    @MockitoBean
    private RoleRepo roleRepo;

    @MockitoBean
    private ProjectCreateService projectCreateService;

    @Test
    void anonymousAccountRequestIsUnauthorized() throws Exception {
        mockMvc.perform(get("/sybeUser/all").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void oauthAuthorizationIsNotPublicInBearerTokenBaseline() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void ordinaryUserCannotListUsers() throws Exception {
        mockMvc.perform(get("/sybeUser/all").with(authentication(userAuthentication(7L))))
                .andExpect(status().isForbidden());
    }

    @Test
    void administratorCanListUsersWithoutSerializingPasswords() throws Exception {
        User returnedUser = modelUser(7L, "user@startrack.test", "encoded-password");
        when(userService.allUser()).thenReturn(Collections.singletonList(returnedUser));

        mockMvc.perform(get("/sybeUser/all").with(authentication(adminAuthentication(1L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]", not(hasKey("password"))));
    }

    @Test
    void administratorCanDeleteActivateAndAssignRoles() throws Exception {
        mockMvc.perform(delete("/sybeUser/delete/user@startrack.test")
                        .with(authentication(adminAuthentication(1L))))
                .andExpect(status().isOk());
        mockMvc.perform(put("/sybeUser/activate/user@startrack.test")
                        .with(authentication(adminAuthentication(1L)))
                        .with(csrf()))
                .andExpect(status().isOk());
        mockMvc.perform(put("/sybeUser/roleUpdate/user@startrack.test/ROLE_USER")
                        .with(authentication(adminAuthentication(1L)))
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    void ordinaryUserCannotDeleteActivateOrAssignRoles() throws Exception {
        mockMvc.perform(delete("/sybeUser/delete/other@startrack.test")
                        .with(authentication(userAuthentication(7L))))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/sybeUser/activate/other@startrack.test")
                        .with(authentication(userAuthentication(7L)))
                        .with(csrf()))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/sybeUser/roleUpdate/other@startrack.test/ROLE_ADMIN")
                        .with(authentication(userAuthentication(7L)))
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void userCanReadOwnProfile() throws Exception {
        when(userService.findUserDataById(7L)).thenReturn(modelUser(7L, "user@startrack.test", "encoded-password"));

        mockMvc.perform(get("/sybeUser/7").with(authentication(userAuthentication(7L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(hasKey("password"))));
    }

    @Test
    void userCanChangeOwnProfileAndPasswordAndRequestDeletion() throws Exception {
        mockMvc.perform(post("/sybeUser/passwordUpdate/7")
                        .with(authentication(userAuthentication(7L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"changed-password\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(post("/sybeUser/profileUpdate/7")
                        .with(authentication(userAuthentication(7L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Own\",\"lastName\":\"User\",\"email\":\"user@startrack.test\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(put("/sybeUser/deleteRequest/user@startrack.test")
                        .with(authentication(userAuthentication(7L)))
                        .with(csrf()))
                .andExpect(status().isOk());
        verify(userService).deleteUserRequest(7L);
    }

    @Test
    void userCannotReadAnotherProfile() throws Exception {
        mockMvc.perform(get("/sybeUser/8").with(authentication(userAuthentication(7L))))
                .andExpect(status().isForbidden());
    }

    @Test
    void userCannotChangeAnotherUsersPasswordOrProfile() throws Exception {
        mockMvc.perform(post("/sybeUser/passwordUpdate/8")
                        .with(authentication(userAuthentication(7L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"changed-password\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/sybeUser/profileUpdate/8")
                        .with(authentication(userAuthentication(7L)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"Other\",\"lastName\":\"User\",\"email\":\"other@startrack.test\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void userCanOnlyRequestDeletionForOwnEmail() throws Exception {
        mockMvc.perform(put("/sybeUser/deleteRequest/other@startrack.test")
                        .with(authentication(userAuthentication(7L)))
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deletionRequestCannotTargetAnEmailDifferingOnlyInCase() throws Exception {
        // Email lookups in PostgreSQL are case-sensitive in the inherited schema.
        mockMvc.perform(put("/sybeUser/deleteRequest/USER@startrack.test")
                        .with(authentication(userAuthentication(7L))))
                .andExpect(status().isForbidden());
        verifyNoInteractions(userService);
    }

    @Test
    void roleManagementIsAdministratorOnly() throws Exception {
        mockMvc.perform(get("/role/all").with(authentication(userAuthentication(7L))))
                .andExpect(status().isForbidden());

        when(roleRepo.findRoles()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/role/all").with(authentication(adminAuthentication(1L))))
                .andExpect(status().isOk());
    }

    @Test
    void legacyStateChangingGetRoutesAreNotAllowed() throws Exception {
        mockMvc.perform(get("/sybeUser/delete/user@startrack.test").with(authentication(adminAuthentication(1L))))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(get("/sybeUser/activate/user@startrack.test").with(authentication(adminAuthentication(1L))))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(get("/sybeUser/roleUpdate/user@startrack.test/ROLE_USER").with(authentication(adminAuthentication(1L))))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(get("/sybeUser/deleteRequest/user@startrack.test").with(authentication(userAuthentication(7L))))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(get("/projectCreate/delete/1").with(authentication(userAuthentication(7L))))
                .andExpect(status().isMethodNotAllowed());
        mockMvc.perform(get("/projectCreate/permUpdate/1/read").with(authentication(userAuthentication(7L))))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void fixedPasswordResetRoutesDoNotExist() throws Exception {
        mockMvc.perform(get("/sybeUser/resetPassword/user@startrack.test").with(authentication(adminAuthentication(1L))))
                .andExpect(status().isNotFound());
        mockMvc.perform(put("/sybeUser/resetPassword/user@startrack.test")
                        .with(authentication(adminAuthentication(1L)))
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    void onlyConfiguredOriginReceivesCorsPermission() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/sybeUser/all");
        CorsConfiguration configuration = new WebConfig("http://127.0.0.1:4200")
                .corsConfigurationSource()
                .getCorsConfiguration(request);

        org.junit.jupiter.api.Assertions.assertNotNull(configuration);
        org.junit.jupiter.api.Assertions.assertEquals(
                "http://127.0.0.1:4200",
                configuration.checkOrigin("http://127.0.0.1:4200")
        );
        org.junit.jupiter.api.Assertions.assertNull(configuration.checkOrigin("https://unapproved.example"));
    }

    @Test
    void userEntityNeverSerializesPassword() throws Exception {
        String json = objectMapper.writeValueAsString(modelUser(7L, "user@startrack.test", "encoded-password"));
        org.junit.jupiter.api.Assertions.assertFalse(json.contains("password"));
        org.junit.jupiter.api.Assertions.assertFalse(json.contains("encoded-password"));
    }

    private UsernamePasswordAuthenticationToken userAuthentication(long id) {
        return authenticationFor(id, "user@startrack.test", "ROLE_USER");
    }

    private UsernamePasswordAuthenticationToken adminAuthentication(long id) {
        return authenticationFor(id, "admin@startrack.test", "ROLE_USER", "ROLE_ADMIN");
    }

    private UsernamePasswordAuthenticationToken authenticationFor(long id, String email, String... roles) {
        User user = modelUser(id, email, "encoded-password");
        java.util.List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
        for (String role : roles) {
            authorities.add(new SimpleGrantedAuthority(role));
        }
        LocalUser principal = new LocalUser(user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword(),
                true, false, true, true, true, authorities, user);
        return new UsernamePasswordAuthenticationToken(principal, null, authorities);
    }

    private User modelUser(long id, String email, String password) {
        User user = new User();
        user.setId(id);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail(email);
        user.setPassword(password);
        user.setEnabled(true);
        return user;
    }

    @TestConfiguration
    @EnableWebSecurity
    @EnableMethodSecurity(prePostEnabled = true)
    static class TestSecurityConfiguration {
        @Autowired
        @Qualifier("corsConfigurationSource")
        private CorsConfigurationSource corsConfigurationSource;

        @Bean
        SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            http.cors(cors -> cors.configurationSource(corsConfigurationSource))
                    .csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(authorization -> authorization.anyRequest().authenticated())
                    .httpBasic(Customizer.withDefaults());
            return http.build();
        }
    }
}
