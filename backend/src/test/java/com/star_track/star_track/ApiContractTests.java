package com.star_track.star_track;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.star_track.star_track.starTrack.dto.*;
import com.star_track.star_track.starTrack.model.Role;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.registration.controller.AuthController;
import com.star_track.star_track.starTrack.registration.controller.UserController;
import com.star_track.star_track.starTrack.registration.dto.*;
import com.star_track.star_track.starTrack.resource.ProjectCreateResource;
import com.star_track.star_track.starTrack.resource.RoleResource;
import com.star_track.star_track.starTrack.resource.UserResource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

import static org.junit.jupiter.api.Assertions.*;

/** Serialization and route-shape contracts only: no application, database or network startup. */
@JsonTest
@ContextConfiguration(classes = JacksonAutoConfiguration.class)
class ApiContractTests {
    @Autowired
    private ObjectMapper mapper;

    private static final String PROJECT_FIELDS = "id projectName lastNamePI firstNamePI emailPI departmentPI "
            + "crsidPI otherInforPI ttoContractName ttoContractEmail ttoContractOtherInfo modality modalityOther "
            + "areaOfExpertise areaOfExpertiseOther readiness projectBackground briefDescription";
    private static final String FUNDING_FIELDS = "id funding fundingOther fundingNIHR fundingNIHROther "
            + "fundingUKRIMRC fundingUKRIMRCOther fundingWellcomeTrust fundingWellcomeTrustOther scheme schemeOther "
            + "value fundingStartDate fundingEndDate aims grantNumber worktribeNumber";
    private static final String OVERVIEW_FIELDS = "id fundingOverview fundingOverviewOther fundingOverviewNIHR "
            + "fundingOverviewNIHROther fundingOverviewUKRIMRC fundingOverviewUKRIMRCOther fundingOverviewWellcomeTrust "
            + "fundingOverviewWellcomeTrustOther schemeOverview schemeOverviewOther valueOverview "
            + "fundingOverviewStartDate fundingOverviewEndDate aimsOverview grantNumberOverview worktribeNumberOverview";

    @Test
    void retainsAllThirtyFourMethodAndPathContracts() {
        Set<String> actual = new TreeSet<>();
        for (Class<?> controller : Arrays.asList(AuthController.class, UserController.class,
                UserResource.class, RoleResource.class, ProjectCreateResource.class)) {
            RequestMapping base = controller.getAnnotation(RequestMapping.class);
            for (Method method : controller.getDeclaredMethods()) {
                RequestMapping mapping = AnnotatedElementUtils.findMergedAnnotation(method, RequestMapping.class);
                if (mapping == null) continue;
                assertEquals(1, mapping.method().length, method.getName());
                for (String suffix : mapping.value()) {
                    for (RequestMethod verb : mapping.method()) {
                        assertTrue(actual.add(verb + " " + base.value()[0] + suffix), "Duplicate route");
                    }
                }
            }
        }
        Set<String> expected = new TreeSet<>(Arrays.asList(
                "POST /api/auth/signin", "POST /api/auth/signup", "GET /api/all", "GET /api/user/me",
                "GET /api/user", "GET /api/admin", "GET /sybeUser/all", "GET /sybeUser/{id}",
                "GET /sybeUser/userData", "DELETE /sybeUser/delete/{email}", "PUT /sybeUser/activate/{email}",
                "PUT /sybeUser/roleUpdate/{email}/{role}", "POST /sybeUser/passwordUpdate/{id}",
                "POST /sybeUser/profileUpdate/{id}", "PUT /sybeUser/deleteRequest/{email}",
                "GET /role/all", "GET /role/details/{id}", "PUT /role/update/{id}", "DELETE /role/delete/{id}",
                "GET /projectCreate/allData", "GET /projectCreate/allDatalatest",
                "GET /projectCreate/allDataHistroy/{data1}", "POST /projectCreate/addToProjectCreate/{email}",
                "DELETE /projectCreate/delete/{id}", "PUT /projectCreate/permUpdate/{id}/{applyValue}",
                "GET /projectCreate/allGroupMember/{id}", "GET /projectCreate/allOutput/{id}",
                "GET /projectCreate/allCollaboration/{id}", "GET /projectCreate/allExternalAdvisor/{id}",
                "GET /projectCreate/allSubcontractor/{id}", "GET /projectCreate/allPPI/{id}",
                "GET /projectCreate/allOTR/{id}", "GET /projectCreate/allFunding/{id}",
                "GET /projectCreate/allFundingOverview/{id}"));
        assertEquals(34, actual.size());
        assertEquals(expected, actual);
    }

    @Test
    void authenticationAndAccountDtosRetainTheirFieldsAndIdTypes() throws Exception {
        UserInfo info = new UserInfo("7", "Synthetic", "User", "user@startrack.test",
                Collections.singletonList("ROLE_USER"));
        assertFields(info, "id firstName lastName email roles");
        assertTrue(mapper.valueToTree(info).get("id").isTextual());
        assertFields(new JwtAuthenticationResponse("synthetic-token", info), "accessToken user");
        assertFields(new ApiResponse(true, "synthetic-message"), "success message");
        assertFields(new LoginRequest(), "email password");
        assertFields(new SignUpRequest(null, "Synthetic", "User", "user@startrack.test", "synthetic", SocialProvider.LOCAL),
                "userID providerUserId firstName lastName email socialProvider password matchingPassword");
        assertFields(new UserManagementResponse(),
                "id firstName lastName email createdDate modifiedDate enabled delete role_id role");
        assertFields(new UserPasswordResponse(), "password");
        assertFields(new TimeSlotData(), "description");
    }

    @Test
    void entityAndNestedRoleResponsesNeverExposePasswordOrUserRoles() throws Exception {
        User user = new User();
        user.setId(7L);
        user.setPassword("synthetic-hash-not-a-real-password");
        assertFields(user, "id createdDate modifiedDate firstName lastName email delete enabled provider providerUserId");
        assertTrue(mapper.valueToTree(user).get("id").isIntegralNumber());
        Role role = new Role();
        role.setId(2L);
        role.setName("ROLE_USER");
        role.setUsers(Collections.singleton(user));
        user.setRoles(Collections.singleton(role));
        JsonNode nested = mapper.valueToTree(role);
        assertFields(role, "id name users");
        assertFalse(nested.get("users").get(0).has("password"));
        assertFalse(nested.get("users").get(0).has("roles"));
    }

    @Test
    void projectRequestAndListResponsesRetainDistinctFieldSets() throws Exception {
        assertFields(new ProjectCreateDTO(), PROJECT_FIELDS + " groupMemberRows subContractorsRows ppiRows "
                + "funding fundingOther duration grantNumber value fundingNIHR fundingNIHROther fundingUKRIMRC "
                + "fundingUKRIMRCOther fundingWellcomeTrust fundingWellcomeTrustOther outputRows collaborationRows "
                + "externalAdvisorsRows fundingRows fundingOverviewRows otrRows");
        assertFields(new ProjectDataResponse(), PROJECT_FIELDS + " fundingOverview fundingOverviewOther "
                + "schemeOverview valueOverview fundingOverviewStartDate fundingOverviewEndDate grantNumberOverview "
                + "worktribeNumberOverview createdEmail createdDate modifyEmail applyValue");
    }

    @Test
    void allNineChildContractsRetainTheirExactNames() throws Exception {
        assertFields(new GroupMemberRowsResponse(), "id lastNamePostDoc firstNamePostDoc emailPostDoc "
                + "departmentPostDoc positionPostDoc crsidPostDoc otherInforPostDoc");
        assertFields(new OutputRowsResponse(), "id output confirmation outputQuantity output_description");
        assertFields(new CollaborationRowsResponse(), "id collaboration collaborationName collaborationEmail "
                + "collaborationLocation collaborationOtherInfo");
        assertFields(new ExternalAdvisorsRowsResponse(), "id externalAdvisorsMeeting externalAdvisorsOrganisation "
                + "externalAdvisorsName externalAdvisorsEmail externalAdvisorsOutcome externalAdvisorsExpertise");
        assertFields(new SubContractorsRowsResponse(), "id subContractorsName subContractorsEmail "
                + "subContractorsExpertise subContractorsOrganisation subContractorsOtherInfo");
        assertFields(new PpiRowsResponse(), "id ppiMeeting ppiContact ppiGroup ppiOutcome");
        assertFields(new otrRowsResponse(), "id otrTeamMember otrRole otrFunding otrDate otrOtherInfo");
        assertFields(new FundingRowsResponse(), FUNDING_FIELDS);
        assertFields(new FundingRowsByID(), FUNDING_FIELDS);
        assertFields(new FundingOverviewRowsResponse(), OVERVIEW_FIELDS);
        assertFields(new FundingOverviewRowsByID(), OVERVIEW_FIELDS);
    }

    @Test
    void fundingSelectionsAreArraysOnInputButStringsOnOutput() throws Exception {
        FundingRowsResponse request = mapper.readValue("{\"funding\":[\"synthetic-source\"],\"value\":12}", FundingRowsResponse.class);
        assertEquals(Collections.singletonList("synthetic-source"), request.getFunding());
        FundingRowsByID response = new FundingRowsByID();
        response.setFunding("[synthetic-source]");
        assertTrue(mapper.valueToTree(request).get("funding").isArray());
        assertTrue(mapper.valueToTree(response).get("funding").isTextual());
        assertEquals(0, new FundingRowsResponse().getValue());
        assertEquals(0, new FundingOverviewRowsResponse().getValueOverview());
    }

    @Test
    void bootDateSerializationIsAnIsoStringAndRoundTripsMilliseconds() throws Exception {
        Date instant = Date.from(Instant.parse("2026-01-02T03:04:05.123Z"));
        ExternalAdvisorsRowsResponse input = new ExternalAdvisorsRowsResponse();
        input.setExternalAdvisorsMeeting(instant);
        JsonNode encoded = mapper.valueToTree(input);
        assertTrue(encoded.get("externalAdvisorsMeeting").isTextual());
        assertTrue(encoded.get("externalAdvisorsMeeting").asText().startsWith("2026-01-02T03:04:05.123"));
        assertEquals(instant, mapper.treeToValue(encoded, ExternalAdvisorsRowsResponse.class).getExternalAdvisorsMeeting());
    }

    @Test
    void omittedNullableFieldsAndPrimitiveDefaultsRemainVisible() throws Exception {
        JsonNode output = mapper.valueToTree(new OutputRowsResponse());
        assertTrue(output.has("outputQuantity"));
        assertTrue(output.get("outputQuantity").isNull());
        JsonNode overview = mapper.valueToTree(new FundingOverviewRowsResponse());
        assertEquals(0, overview.get("valueOverview").intValue());
        assertTrue(overview.get("fundingOverview").isNull());
    }

    private void assertFields(Object value, String expected) throws Exception {
        Set<String> fields = new HashSet<>();
        mapper.readTree(mapper.writeValueAsString(value)).fieldNames().forEachRemaining(fields::add);
        assertEquals(new HashSet<>(Arrays.asList(expected.split(" "))), fields, value.getClass().getSimpleName());
    }
}
