/**
 * Define fields values for user
 */
package com.star_track.star_track.starTrack.registration.dto;

import lombok.Value;

import java.util.List;

@Value
public class UserInfo {
    private String id, firstName, lastName, email;
    private List<String> roles;
}