package com.star_track.star_track;

import com.star_track.star_track.starTrack.dto.UserManagementResponse;
import com.star_track.star_track.starTrack.dto.UserPasswordResponse;
import com.star_track.star_track.starTrack.exception.ApiRequestException;
import com.star_track.star_track.starTrack.model.Role;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.registration.exception.ResourceNotFoundException;
import com.star_track.star_track.starTrack.repo.RoleRepo;
import com.star_track.star_track.starTrack.repo.UserRepo;
import com.star_track.star_track.starTrack.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceSafetyTests {
    private final UserRepo users = mock(UserRepo.class);
    private final RoleRepo roles = mock(RoleRepo.class);
    private final PasswordEncoder encoder = mock(PasswordEncoder.class);
    private final UserService service = new UserService(users, roles);

    UserServiceSafetyTests() { ReflectionTestUtils.setField(service, "passwordEncoder", encoder); }

    @Test void missingIdsUseNotFoundRatherThanBadRequestOrLazyProxy() {
        when(users.findDataById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.findUserDataById(99L));
        assertThrows(ResourceNotFoundException.class, () -> service.updateUserProfile(99L, new UserManagementResponse()));
        assertThrows(ResourceNotFoundException.class, () -> service.updateUserPassword(99L, new UserPasswordResponse("synthetic")));
        verifyNoInteractions(encoder);
        verify(users, never()).save(any());
    }

    @Test void missingEmailOperationsUseNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> service.activateUser("absent@startrack.test"));
        assertThrows(ResourceNotFoundException.class, () -> service.deleteUser("absent@startrack.test"));
        assertThrows(ResourceNotFoundException.class, () -> service.updateUserRole("absent@startrack.test", new ArrayList<>(List.of("ROLE_USER"))));
    }

    @Test void administratorDeletionDeactivatesWithoutRemovingIdentityRolesOrAttribution() {
        User account = account();
        account.setEnabled(true);
        Set<Role> originalRoles = account.getRoles();
        when(users.findByEmail(account.getEmail())).thenReturn(account);
        long before = System.currentTimeMillis();

        assertNull(service.deleteUser(account.getEmail()), "Preserve legacy empty success response");

        assertFalse(account.isEnabled());
        assertTrue(account.isDelete());
        assertEquals(7L, account.getId());
        assertEquals("user@startrack.test", account.getEmail());
        assertEquals("synthetic-hash", account.getPassword());
        assertSame(originalRoles, account.getRoles());
        assertNotNull(account.getModifiedDate());
        assertTrue(account.getModifiedDate().getTime() >= before);
        verify(users).save(account);
        verify(users, never()).deleteById(any());
        verify(users, never()).delete(any());
        verifyNoInteractions(roles, encoder);
    }

    @Test void repeatedDeactivationRetainsTheExistingAccount() {
        User account = account();
        account.setEnabled(false);
        account.setDelete(true);
        when(users.findByEmail(account.getEmail())).thenReturn(account);
        assertNull(service.deleteUser(account.getEmail()));
        assertFalse(account.isEnabled());
        assertTrue(account.isDelete());
        assertEquals(7L, account.getId());
        verify(users).save(account);
        verify(users, never()).deleteById(any());
    }

    @Test void unknownRoleDoesNotMutateTheManagedAccount() {
        User account = account();
        Set<Role> originalRoles = account.getRoles();
        when(users.findByEmail(account.getEmail())).thenReturn(account);
        when(roles.findByName("ROLE_USER")).thenReturn(originalRoles.iterator().next());
        assertThrows(ApiRequestException.class, () -> service.updateUserRole(account.getEmail(),
                new ArrayList<>(List.of("ROLE_USER", "UNKNOWN"))));
        assertSame(originalRoles, account.getRoles());
        assertNull(account.getModifiedDate());
        verify(users, never()).save(any());
    }

    @Test void profileUpdatesCannotSetIdentityRolesOrActivationFlags() {
        User account = account();
        Set<Role> originalRoles = account.getRoles();
        when(users.findDataById(7L)).thenReturn(Optional.of(account));
        when(users.getById(7L)).thenReturn(account);
        when(users.save(account)).thenReturn(account);
        UserManagementResponse request = new UserManagementResponse();
        request.setId(99L);
        request.setFirstName("Updated");
        request.setLastName("Name");
        request.setEmail("updated@startrack.test");
        request.setEnabled(true);
        request.setDelete(true);
        request.setRole("ROLE_ADMIN");
        request.setRole_id(1L);
        service.updateUserProfile(7L, request);
        assertEquals(7L, account.getId());
        assertEquals("Updated", account.getFirstName());
        assertEquals("updated@startrack.test", account.getEmail());
        assertFalse(account.isEnabled());
        assertFalse(account.isDelete());
        assertSame(originalRoles, account.getRoles());
        assertEquals("synthetic-hash", account.getPassword());
    }

    private User account() {
        User account = new User();
        account.setId(7L);
        account.setEmail("user@startrack.test");
        account.setPassword("synthetic-hash");
        Role role = new Role();
        role.setId(2L);
        role.setName("ROLE_USER");
        account.setRoles(Set.of(role));
        return account;
    }
}
