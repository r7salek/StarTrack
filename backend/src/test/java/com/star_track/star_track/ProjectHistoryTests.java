package com.star_track.star_track;

import com.star_track.star_track.starTrack.dto.ProjectCreateDTO;
import com.star_track.star_track.starTrack.exception.ProjectConflictException;
import com.star_track.star_track.starTrack.model.*;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import com.star_track.star_track.starTrack.repo.*;
import com.star_track.star_track.starTrack.service.ProjectCreateService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectHistoryTests {
    final UserRepo users = mock(UserRepo.class);
    final ProjectRepo roots = mock(ProjectRepo.class);
    final ProjectCreateRepo versions = mock(ProjectCreateRepo.class);
    final ProjectCreateService service = new ProjectCreateService(users, versions, roots);
    final UUID projectId = UUID.fromString("133eb47c-b775-4013-b6ae-502d6c213056");

    @BeforeEach void authenticate() {
        User actor = new User();
        actor.setId(7L);
        actor.setEnabled(true);
        actor.setEmail("actor@startrack.test");
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        LocalUser principal = new LocalUser(actor.getEmail(), "Synthetic", "Actor", "synthetic-password",
                true, false, true, true, true, authorities, actor);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal, null, authorities));
        when(users.findById(7L)).thenReturn(Optional.of(actor));
        when(versions.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @AfterEach void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @Test void newProjectsHaveIndependentIdsEvenWhenNamesMatchAndIgnoreLegacyUrlEmail() {
        ProjectCreate first = service.AddToProjectCreate("forged@startrack.test", payload());
        ProjectCreate second = service.AddToProjectCreate("forged@startrack.test", payload());
        assertNotNull(first.getProjectId());
        assertNotEquals(first.getProjectId(), second.getProjectId());
        assertEquals(first.getProjectName(), second.getProjectName());
        assertEquals(1, first.getVersionNumber());
        assertEquals(7L, first.getCreatedBy());
        assertEquals(7L, first.getModifiedBy());
        assertEquals("actor@startrack.test", first.getCreatedEmail());
        var rootCaptor = org.mockito.ArgumentCaptor.forClass(Project.class);
        verify(roots, times(2)).saveAndFlush(rootCaptor.capture());
        assertEquals(7L, rootCaptor.getAllValues().get(0).getCreatedBy());
        verify(users, never()).findByEmail(anyString());
    }

    @Test void appendLocksPermanentRootChecksExpectedVersionAndPreservesOldSnapshot() {
        Project root = root(false);
        ProjectCreate previous = previous(2);
        previous.setProjectName("Before rename");
        previous.setApplyValue(ProjectCreate.ACCEPTED);
        when(roots.lockById(projectId)).thenReturn(Optional.of(root));
        when(versions.findFirstByProjectIdOrderByVersionNumberDesc(projectId)).thenReturn(Optional.of(previous));
        ProjectCreateDTO dto = payload();
        dto.setProjectName("After rename");
        ProjectCreate next = service.append(projectId, 2, dto);
        assertEquals(projectId, next.getProjectId());
        assertEquals(3, next.getVersionNumber());
        assertEquals("After rename", next.getProjectName());
        assertEquals(ProjectCreate.ACCEPTED, next.getApplyValue());
        assertEquals("Before rename", previous.getProjectName());
        assertEquals(2, previous.getVersionNumber());
        var order = inOrder(roots, versions);
        order.verify(roots).lockById(projectId);
        order.verify(versions, times(2)).findFirstByProjectIdOrderByVersionNumberDesc(projectId);
        order.verify(versions).saveAndFlush(next);
    }

    @Test void staleOrArchivedProjectRejectsAppendBeforeSavingAnything() {
        Project root = root(false);
        when(roots.lockById(projectId)).thenReturn(Optional.of(root));
        when(versions.findFirstByProjectIdOrderByVersionNumberDesc(projectId)).thenReturn(Optional.of(previous(3)));
        assertThrows(ProjectConflictException.class, () -> service.append(projectId, 2, payload()));
        root.setArchived(true);
        assertThrows(ProjectConflictException.class, () -> service.append(projectId, 3, payload()));
        verify(versions, never()).saveAndFlush(any());
    }

    @Test void suppliedLegacyVersionCannotReferToAnotherPermanentProject() {
        when(roots.lockById(projectId)).thenReturn(Optional.of(root(false)));
        when(versions.findFirstByProjectIdOrderByVersionNumberDesc(projectId)).thenReturn(Optional.of(previous(1)));
        ProjectCreate foreign = previous(1);
        foreign.setProjectId(UUID.randomUUID());
        when(versions.findById(99L)).thenReturn(Optional.of(foreign));
        ProjectCreateDTO dto = payload();
        dto.setId(99L);
        assertThrows(ProjectConflictException.class, () -> service.append(projectId, 1, dto));
        verify(versions, never()).saveAndFlush(any());
    }

    @Test void statusUpdateAppendsFreshChildRecordsWithoutHistoricBackReferences() {
        ProjectCreate previous = previous(1);
        GroupMemberRows member = new GroupMemberRows();
        member.setId(31L);
        member.setFirstNamePostDoc("Historic member");
        member.setProjectCreate(Set.of(previous));
        previous.setGroupMemberRows(Set.of(member));
        when(versions.findById(10L)).thenReturn(Optional.of(previous));
        when(roots.lockById(projectId)).thenReturn(Optional.of(root(false)));
        when(versions.findFirstByProjectIdOrderByVersionNumberDesc(projectId)).thenReturn(Optional.of(previous));
        ProjectCreate next = service.updateUserPerm(10L, ProjectCreate.ACCEPTED);
        assertEquals(2, next.getVersionNumber());
        assertEquals(ProjectCreate.ACCEPTED, next.getApplyValue());
        assertEquals(ProjectCreate.SUBMITTED, previous.getApplyValue());
        GroupMemberRows copy = next.getGroupMemberRows().iterator().next();
        assertNotSame(member, copy);
        assertNull(copy.getId());
        assertEquals("Historic member", copy.getFirstNamePostDoc());
        assertTrue(copy.getProjectCreate() == null || copy.getProjectCreate().isEmpty());
        assertEquals(31L, member.getId());
        assertEquals(Set.of(previous), member.getProjectCreate());
    }

    @Test void archiveRetainsVersionsAndRecordsActorOnce() {
        Project root = root(false);
        when(roots.lockById(projectId)).thenReturn(Optional.of(root));
        service.archive(projectId);
        assertTrue(root.isArchived());
        assertEquals(7L, root.getArchivedBy());
        assertNotNull(root.getArchivedAt());
        Date archivedAt = root.getArchivedAt();
        service.archive(projectId);
        assertSame(archivedAt, root.getArchivedAt());
        verify(roots).save(root);
        verifyNoInteractions(versions);
        verify(roots, never()).delete(any());
    }

    @Test void statusCopyPreservesDistinctHistoricRowsWithIdenticalBusinessValues() {
        ProjectCreate previous = previous(1);
        GroupMemberRows first = new GroupMemberRows();
        first.setId(31L);
        first.setFirstNamePostDoc("Identical value");
        GroupMemberRows second = new GroupMemberRows();
        second.setId(32L);
        second.setFirstNamePostDoc("Identical value");
        previous.setGroupMemberRows(new HashSet<>(List.of(first, second)));
        when(versions.findById(10L)).thenReturn(Optional.of(previous));
        when(roots.lockById(projectId)).thenReturn(Optional.of(root(false)));
        when(versions.findFirstByProjectIdOrderByVersionNumberDesc(projectId)).thenReturn(Optional.of(previous));

        ProjectCreate next = service.updateUserPerm(10L, ProjectCreate.ACCEPTED);

        assertEquals(2, next.getGroupMemberRows().size(), "Distinct old rows must not collapse when fresh IDs are assigned");
        var copies = new ArrayList<>(next.getGroupMemberRows());
        assertNotSame(copies.get(0), copies.get(1));
        for (GroupMemberRows copy : copies) {
            assertNull(copy.getId());
            assertEquals("Identical value", copy.getFirstNamePostDoc());
            assertNotSame(first, copy);
            assertNotSame(second, copy);
        }
        assertEquals(31L, first.getId());
        assertEquals(32L, second.getId());
        assertEquals(2, previous.getGroupMemberRows().size());
    }

    @Test void identicalInputRowsRemainDistinctNewChildSnapshots() {
        ProjectCreateDTO dto = payload();
        var first = new com.star_track.star_track.starTrack.dto.GroupMemberRowsResponse();
        first.setFirstNamePostDoc("Identical input");
        var second = new com.star_track.star_track.starTrack.dto.GroupMemberRowsResponse();
        second.setFirstNamePostDoc("Identical input");
        dto.setGroupMemberRows(List.of(first, second));

        ProjectCreate created = service.create(dto);

        assertEquals(2, created.getGroupMemberRows().size());
        var copies = new ArrayList<>(created.getGroupMemberRows());
        assertNotSame(copies.get(0), copies.get(1));
        assertEquals("Identical input", copies.get(0).getFirstNamePostDoc());
        assertEquals("Identical input", copies.get(1).getFirstNamePostDoc());
    }

    @Test void ambiguousLegacyNameNeverCombinesIndependentHistories() {
        ProjectCreate first = previous(1);
        ProjectCreate second = previous(1);
        second.setProjectId(UUID.randomUUID());
        when(versions.findByProjectName("Same title")).thenReturn(List.of(first, second));
        assertThrows(ProjectConflictException.class, () -> service.getCreateProjectDataHistory("Same title"));
        verify(versions, never()).findByProjectIdOrderByVersionNumberDesc(any());
    }

    private Project root(boolean archived) {
        Project root = new Project();
        root.setId(projectId);
        root.setArchived(archived);
        return root;
    }

    private ProjectCreate previous(int number) {
        ProjectCreate entity = new ProjectCreate();
        entity.setId(10L);
        entity.setProjectId(projectId);
        entity.setVersionNumber(number);
        entity.setApplyValue(ProjectCreate.SUBMITTED);
        entity.setGroupMemberRows(new HashSet<>());
        entity.setOutputRows(new HashSet<>());
        entity.setCollaborationRows(new HashSet<>());
        entity.setExternalAdvisorsRows(new HashSet<>());
        entity.setSubContractorsRows(new HashSet<>());
        entity.setPpiRows(new HashSet<>());
        entity.setOtrRows(new HashSet<>());
        entity.setFundingRows(new HashSet<>());
        entity.setFundingOverviewRows(new HashSet<>());
        return entity;
    }

    static ProjectCreateDTO payload() {
        ProjectCreateDTO dto = new ProjectCreateDTO();
        dto.setProjectName("Same title");
        dto.setGroupMemberRows(List.of());
        dto.setOutputRows(List.of());
        dto.setCollaborationRows(List.of());
        dto.setExternalAdvisorsRows(List.of());
        dto.setSubContractorsRows(List.of());
        dto.setPpiRows(List.of());
        dto.setOtrRows(List.of());
        dto.setFundingRows(List.of());
        dto.setFundingOverviewRows(List.of());
        return dto;
    }
}
