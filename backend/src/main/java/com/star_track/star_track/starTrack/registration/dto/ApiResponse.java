/**
 * Send response the user login is successful or not
 */
package com.star_track.star_track.starTrack.registration.dto;

import lombok.Value;

@Value
public class ApiResponse {
    private Boolean success;
    private String message;
}
