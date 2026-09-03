/**
 * login request get values from client
 */
package com.star_track.star_track.starTrack.registration.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}