package com.star_track.star_track.starTrack.registration.exception.handler;

import com.star_track.star_track.starTrack.exception.ApiException;
import com.star_track.star_track.starTrack.exception.RequestIdFilter;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import java.util.Map;
import java.util.TreeMap;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception error, Object ignoredBody,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String requestId = RequestIdFilter.requestId(((ServletWebRequest) request).getRequest());
        HttpHeaders safeHeaders = new HttpHeaders();
        safeHeaders.putAll(headers); // Preserve framework headers, especially Allow for 405.
        safeHeaders.set(RequestIdFilter.HEADER, requestId);
        Map<String, String> fields = new TreeMap<>();
        if (error instanceof MethodArgumentNotValidException invalid) {
            invalid.getBindingResult().getFieldErrors().forEach(field -> {
                if (field.getField().matches("[A-Za-z][A-Za-z0-9]*(?:\\[[0-9]+\\])?(?:\\.[A-Za-z][A-Za-z0-9]*(?:\\[[0-9]+\\])?)*")) {
                    fields.put(field.getField(), "Invalid value.");
                }
            });
        }
        return new ResponseEntity<>(ApiException.forStatus(status.value(), fields, requestId), safeHeaders, status);
    }
}
