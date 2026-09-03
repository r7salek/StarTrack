package com.star_track.star_track.starTrack.registration.util;

import com.star_track.star_track.starTrack.model.Role;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import com.star_track.star_track.starTrack.registration.dto.SocialProvider;
import com.star_track.star_track.starTrack.registration.dto.UserInfo;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author zaheer
 * Logic for building local user and if signp using social sites
 */
public class GeneralUtils {

    public static List<SimpleGrantedAuthority> buildSimpleGrantedAuthorities(final Set<Role> roles) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        for (Role role : roles) {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
        }
        return authorities;
    }

    public static SocialProvider toSocialProvider(String providerId) {
        for (SocialProvider socialProvider : SocialProvider.values()) {
            if (socialProvider.getProviderType().equals(providerId)) {
                return socialProvider;
            }
        }
        return SocialProvider.LOCAL;
    }

    public static UserInfo buildUserInfo(LocalUser localUser) {
        List<String> roles = localUser.getAuthorities().stream().map(item -> item.getAuthority()).collect(Collectors.toList());
        com.star_track.star_track.starTrack.model.User user = localUser.getUser();
        return new UserInfo(user.getId().toString(), user.getFirstName(),
                user.getLastName(), user.getEmail(), roles);
    }
}