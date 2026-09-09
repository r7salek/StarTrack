package com.star_track.star_track.starTrack.exception;

import java.util.Map;

/** Safe wire payload, deliberately not a Throwable. */
public record ApiException(boolean success, String code, String message,
                           Map<String, String> fieldErrors, String requestId) {
    public static ApiException forStatus(int status, Map<String, String> fields, String requestId) {
        String code;
        String message;
        switch (status) {
            case 400 -> { code = "BAD_REQUEST"; message = "The request is invalid."; }
            case 401 -> { code = "UNAUTHORIZED"; message = "Authentication is required."; }
            case 403 -> { code = "FORBIDDEN"; message = "You do not have permission for this operation."; }
            case 404 -> { code = "NOT_FOUND"; message = "The requested resource was not found."; }
            case 405 -> { code = "METHOD_NOT_ALLOWED"; message = "This HTTP method is not allowed."; }
            case 409 -> { code = "CONFLICT"; message = "The request conflicts with the current data."; }
            case 415 -> { code = "UNSUPPORTED_MEDIA_TYPE"; message = "The request content type is not supported."; }
            case 422 -> { code = "UNPROCESSABLE_ENTITY"; message = "The request cannot be processed."; }
            default -> { code = status >= 500 ? "INTERNAL_ERROR" : "REQUEST_REJECTED";
                message = status >= 500 ? "An unexpected error occurred." : "The request could not be completed."; }
        }
        return new ApiException(false, code, message, Map.copyOf(fields), requestId);
    }
}
