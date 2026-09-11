package com.star_track.star_track.starTrack.exception;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.UUID;

/** Generated locally, never copied from a caller-controlled header. */
public final class RequestIdFilter extends OncePerRequestFilter {
    public static final String HEADER = "X-Request-ID";
    private static final String ATTRIBUTE = RequestIdFilter.class.getName() + ".id";

    public static String requestId(HttpServletRequest request) {
        Object existing = request.getAttribute(ATTRIBUTE);
        if (existing instanceof String value) return value;
        String value = UUID.randomUUID().toString();
        request.setAttribute(ATTRIBUTE, value);
        return value;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        response.setHeader(HEADER, requestId(request));
        chain.doFilter(request, response);
    }
}
