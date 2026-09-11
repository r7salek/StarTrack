package com.star_track.star_track;

import com.star_track.star_track.starTrack.exception.ApiExceptionHandler;
import com.star_track.star_track.starTrack.exception.ProjectConflictException;
import com.star_track.star_track.starTrack.registration.config.WebConfig;
import com.star_track.star_track.starTrack.registration.config.WebSecurityConfig;
import com.star_track.star_track.starTrack.registration.exception.handler.RestResponseEntityExceptionHandler;
import com.star_track.star_track.starTrack.registration.security.oauth2.*;
import com.star_track.star_track.starTrack.registration.service.LocalUserDetailService;
import com.star_track.star_track.starTrack.resource.ProjectResource;
import com.star_track.star_track.starTrack.service.ProjectCreateService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProjectResource.class)
@ContextConfiguration(classes = {ProjectResource.class, WebConfig.class, WebSecurityConfig.class,
        PropertyPlaceholderAutoConfiguration.class, ProductionSecurityTests.TokenConfiguration.class,
        ApiExceptionHandler.class, RestResponseEntityExceptionHandler.class})
@TestPropertySource(properties = {"startrack.oauth.enabled=false", "startrack.cors.allowed-origins=http://127.0.0.1:4200"})
class ProjectHistoryHttpTests {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean ProjectCreateService service;
    @MockitoBean LocalUserDetailService details;
    @MockitoBean CustomOAuth2UserService oauth;
    @MockitoBean CustomOidcUserService oidc;
    @MockitoBean OAuth2AuthenticationSuccessHandler success;
    @MockitoBean OAuth2AuthenticationFailureHandler failure;
    final UUID projectId = UUID.fromString("133eb47c-b775-4013-b6ae-502d6c213056");

    @Test void allNewProjectOperationsRequireAuthentication() throws Exception {
        for (String path : new String[]{"/api/projects", "/api/projects/" + projectId,
                "/api/projects/" + projectId + "/versions"}) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
        }
        mvc.perform(post("/api/projects").contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/projects/" + projectId + "/versions").contentType("application/json").content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/projects/" + projectId)).andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test void appendConflictIsSafe409WithCorrelatedRequestId() throws Exception {
        var dto = ProjectHistoryTests.payload();
        dto.setExpectedVersion(1);
        when(service.append(eq(projectId), eq(1), any())).thenThrow(new ProjectConflictException());
        var result = mvc.perform(post("/api/projects/" + projectId + "/versions").with(user("synthetic"))
                        .contentType("application/json").content(mapper.writeValueAsString(dto)))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("CONFLICT"))
                .andExpect(content().string(not(containsString("ProjectConflictException")))).andReturn();
        String id = mapper.readTree(result.getResponse().getContentAsString()).get("requestId").asString();
        assertEquals(id, result.getResponse().getHeader("X-Request-ID"));
        UUID.fromString(id);
    }

    @Test void requiredCollectionsAreValidatedBeforeServiceForCreateAndAppend() throws Exception {
        for (String path : new String[]{"/api/projects", "/api/projects/" + projectId + "/versions"}) {
            mvc.perform(post(path).with(user("synthetic")).contentType("application/json").content("{\"expectedVersion\":1}"))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.groupMemberRows").exists())
                    .andExpect(jsonPath("$.fieldErrors.fundingRows").exists());
        }
        verifyNoInteractions(service);
    }

    @Test void archiveReturns204WithoutReturningOrErasingVersions() throws Exception {
        mvc.perform(delete("/api/projects/" + projectId).with(user("synthetic")))
                .andExpect(status().isNoContent()).andExpect(content().string(""));
        verify(service).archive(projectId);
        verifyNoMoreInteractions(service);
    }
}
