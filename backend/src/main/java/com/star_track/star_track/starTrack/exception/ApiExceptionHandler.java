package com.star_track.star_track.starTrack.exception;

import com.star_track.star_track.starTrack.registration.exception.BadRequestException;
import com.star_track.star_track.starTrack.registration.exception.ResourceNotFoundException;
import com.star_track.star_track.starTrack.registration.exception.UserAlreadyExistAuthenticationException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class ApiExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(ApiExceptionHandler.class);
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiException> handle(Exception error, HttpServletRequest request) {
        int status = 500;
        if (error instanceof DataIntegrityViolationException || error instanceof UserAlreadyExistAuthenticationException
                || error instanceof ProjectConflictException) status = 409;
        else if (error instanceof ResourceNotFoundException || error instanceof DataNotFoundException || error instanceof EntityNotFoundException) status = 404;
        else if (error instanceof AccessDeniedException) status = 403;
        else if (error instanceof AuthenticationException) status = 401;
        else if (error instanceof ApiRequestException || error instanceof BadRequestException
                || error instanceof ConstraintViolationException) status = 400;
        String requestId = RequestIdFilter.requestId(request);
        if (status >= 500) {
            logger.error("API failure requestId={} status={} exceptionClass={}", requestId, status, error.getClass().getName());
        }
        return ResponseEntity.status(status).header(RequestIdFilter.HEADER, requestId)
                .body(ApiException.forStatus(status, Map.of(), requestId));
    }
}
