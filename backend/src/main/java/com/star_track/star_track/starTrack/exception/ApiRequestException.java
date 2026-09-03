
/**
 * Get the message related to exception throws
 */
package com.star_track.star_track.starTrack.exception;

public class ApiRequestException extends RuntimeException {
    public ApiRequestException(String message) {
        super(message);
    }
}