package com.star_track.star_track;

import com.star_track.star_track.starTrack.exception.ApiRequestException;
import com.star_track.star_track.starTrack.model.Role;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.registration.exception.ResourceNotFoundException;
import com.star_track.star_track.starTrack.repo.ProjectCreateRepo;
import com.star_track.star_track.starTrack.repo.RoleRepo;
import com.star_track.star_track.starTrack.repo.UserRepo;
import com.star_track.star_track.starTrack.resource.RoleResource;
import com.star_track.star_track.starTrack.service.ProjectCreateService;
import com.star_track.star_track.starTrack.service.RoleService;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResourceLookupTests {
    @Test void missingProjectWritesReturnNotFoundWithoutAttemptingChanges() {
        ProjectCreateRepo projects = mock(ProjectCreateRepo.class);
        ProjectCreateService service = new ProjectCreateService(mock(UserRepo.class), projects,
                mock(com.star_track.star_track.starTrack.repo.ProjectRepo.class));
        when(projects.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.deleteData(99L));
        assertThrows(ResourceNotFoundException.class, () -> service.updateUserPerm(99L, "submitted"));
        verify(projects, never()).deleteById(anyLong());
        verify(projects, never()).save(any());
    }

    @Test void roleDetailsUseNotFoundWhileLegacyRoleWritesKeep422() {
        RoleRepo roles = mock(RoleRepo.class);
        RoleService service = new RoleService(roles);
        assertThrows(ResourceNotFoundException.class, () -> new RoleResource(service, roles).getRole(99L));
        assertEquals(422, assertThrows(ResponseStatusException.class, () -> service.deleteRole(99L)).getStatusCode().value());
        Role input = new Role();
        input.setName("ROLE_USER");
        assertEquals(422, assertThrows(ResponseStatusException.class, () -> service.updateRole(99L, input)).getStatusCode().value());
    }

    @Test void associatedRolesCannotBeDeletedAndBlankNamesDoNotMutate() {
        RoleRepo roles = mock(RoleRepo.class);
        RoleService service = new RoleService(roles);
        Role existing = new Role();
        existing.setName("ROLE_USER");
        existing.setUsers(Set.of(new User()));
        when(roles.findById(2L)).thenReturn(Optional.of(existing));
        when(roles.getOne(2L)).thenReturn(existing);
        assertEquals(422, assertThrows(ResponseStatusException.class, () -> service.deleteRole(2L)).getStatusCode().value());
        assertThrows(ApiRequestException.class, () -> service.updateRole(2L, new Role()));
        assertEquals("ROLE_USER", existing.getName());
        verify(roles, never()).deleteById(anyLong());
        verify(roles, never()).save(any());
    }
}
