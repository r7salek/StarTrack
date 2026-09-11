package com.star_track.star_track.starTrack.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import tools.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;

public final class ApiErrorWriter {
    private final ObjectMapper mapper;
    public ApiErrorWriter(ObjectMapper mapper) { this.mapper = mapper; }

    public void write(HttpServletRequest request, HttpServletResponse response, int status) throws IOException {
        if (response.isCommitted()) return;
        String requestId = RequestIdFilter.requestId(request);
        response.setStatus(status);
        response.setHeader(RequestIdFilter.HEADER, requestId);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), ApiException.forStatus(status, Map.of(), requestId));
    }
}
