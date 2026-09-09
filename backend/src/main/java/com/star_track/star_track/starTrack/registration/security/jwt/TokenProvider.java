/**
 * get user information through token
 */
package com.star_track.star_track.starTrack.registration.security.jwt;

import com.star_track.star_track.starTrack.registration.config.AppProperties;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Date;
import javax.crypto.SecretKey;

@Service
public class TokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(TokenProvider.class);

    private final SecretKey signingKey;
    private final JwtParser parser;
    private final long tokenExpirationMsec;

    public TokenProvider(AppProperties appProperties) {
        // JJWT's old String overload decoded Base64; interpreting it as UTF-8 would invalidate existing tokens.
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(appProperties.getAuth().getTokenSecret()));
        this.parser = Jwts.parser().verifyWith(signingKey)
                .sig().clear().add(Jwts.SIG.HS512).and().build();
        this.tokenExpirationMsec = appProperties.getAuth().getTokenExpirationMsec();
    }

    public String createToken(Authentication authentication) {
        LocalUser userPrincipal = (LocalUser) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + tokenExpirationMsec);
        Long accountId = userPrincipal.getUser().getId();
        if (accountId == null || accountId <= 0) {
            throw new IllegalArgumentException("A permanent positive account ID is required");
        }

        return Jwts.builder().subject(Long.toString(accountId)).issuedAt(now).expiration(expiryDate)
                .signWith(signingKey, Jwts.SIG.HS512).compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parser.parseSignedClaims(token).getPayload();
        String subject = claims.getSubject();
        if (subject == null || !subject.matches("[1-9][0-9]*") || claims.getExpiration() == null) {
            throw new MalformedJwtException("Invalid account token claims");
        }
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException ex) {
            throw new MalformedJwtException("Invalid account token subject");
        }
    }

    public boolean validateToken(String authToken) {
        try {
            getUserIdFromToken(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            // Parser messages can contain token contents: never log the exception or raw input.
            logger.debug("Rejected invalid bearer token");
        }
        return false;
    }
}
