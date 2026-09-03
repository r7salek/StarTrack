package com.star_track.star_track.starTrack.registration.security.oauth2.user;

import java.util.Map;

public class LinkedinOAuth2UserInfo extends OAuth2UserInfo {

    public LinkedinOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return (String) attributes.get("id");
    }

    @Override
    public String getFirstName() {
        return ((String) attributes.get("localizedFirstName")).concat(" ").concat((String) attributes.get("localizedLastName"));
    }
    @Override
    public String getLastName() {
        return ((String) attributes.get("localizedLastName")).concat(" ").concat((String) attributes.get("localizedLastName"));
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("emailAddress");
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("pictureUrl");
    }
}
