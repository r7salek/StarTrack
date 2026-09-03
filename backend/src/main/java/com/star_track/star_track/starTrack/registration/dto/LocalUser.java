package com.star_track.star_track.starTrack.registration.dto;

import com.star_track.star_track.starTrack.registration.util.GeneralUtils;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

/**
 * @author zaheer
 * Create user into database sybe_user table. Some values are pre defines and some values get
 * during registration form filling
 */
public class LocalUser extends User implements OAuth2User, OidcUser {

    private static final long serialVersionUID = -2845160792248762779L;
    private final OidcIdToken idToken;
    private final OidcUserInfo userInfo;
    private Map<String, Object> attributes;
    private com.star_track.star_track.starTrack.model.User user1;

    public LocalUser(final String userID, final String firstName, final String lastName, final String password, final boolean enabled, final boolean delete,
                     final boolean accountNonExpired, final boolean credentialsNonExpired,
                     final boolean accountNonLocked,
                     final Collection<? extends GrantedAuthority> authorities, final com.star_track.star_track.starTrack.model.User user2) {
        this(userID, firstName, lastName, password, enabled, delete, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities, user2, null, null);
    }

    public LocalUser(final String userID, final String firstName, final String lastName,final String password, final boolean enabled, final boolean delete, final boolean accountNonExpired, final boolean credentialsNonExpired,
                     final boolean accountNonLocked, final Collection<? extends GrantedAuthority> authorities, final com.star_track.star_track.starTrack.model.User user2, OidcIdToken idToken,
                     OidcUserInfo userInfo) {
        super(userID, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
        //  this.firstName = firstName;

        this.user1 = user2;
        this.idToken = idToken;
        this.userInfo = userInfo;
    }

    public static LocalUser create(com.star_track.star_track.starTrack.model.User user, Map<String, Object> attributes, OidcIdToken idToken, OidcUserInfo userInfo) {
        LocalUser localUser = new LocalUser(user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getPassword(), user.isEnabled(), user.isDelete(), true, true, true,
                GeneralUtils.buildSimpleGrantedAuthorities(user.getRoles()),
                user, idToken, userInfo);
        localUser.setAttributes(attributes);
        return localUser;
    }

    @Override
    public String getName() {
        return this.user1.getFirstName();
    }

    @Override
    public String getFamilyName() {
        return this.user1.getLastName();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return this.attributes;
    }

    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getClaims() {
        return this.attributes;
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return this.userInfo;
    }

    @Override
    public OidcIdToken getIdToken() {
        return this.idToken;
    }

    public com.star_track.star_track.starTrack.model.User getUser() {
        return user1;
    }
}
