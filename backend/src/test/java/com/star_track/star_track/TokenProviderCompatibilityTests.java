package com.star_track.star_track;

import com.star_track.star_track.starTrack.registration.config.AppProperties;
import com.star_track.star_track.starTrack.registration.security.jwt.TokenProvider;
import com.star_track.star_track.starTrack.model.User;
import com.star_track.star_track.starTrack.registration.dto.LocalUser;
import com.google.gson.JsonParser;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

/** Fixed synthetic legacy wire fixtures; deliberately independent of the JJWT builder API. */
class TokenProviderCompatibilityTests {
    static final String SECRET = "c3RhcnRyYWNrLXN5bnRoZXRpYy1jb21wYXRpYmlsaXR5LWtleS1ub3QtYS1zZWNyZXQtMDEyMzQ1Njc4OWFiY2RlZg==";
    static final String LEGACY_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3IiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjQxMDI0NDQ4MDB9.F6l81MoYl7B_GV-3x02QLcS5qt0MekcHOtEufoATIaSU4v2Gs9lNr8aNC82m7O8T1pihi4x9uf4Cp5YPkbi8gA";

    static TokenProvider provider() {
        AppProperties properties = new AppProperties();
        properties.getAuth().setTokenSecret(SECRET);
        properties.getAuth().setTokenExpirationMsec(60000L);
        return new TokenProvider(properties);
    }

    @Test
    void fixedLegacyHs512TokenUsesBase64DecodedSecretAndAccountId() {
        assertTrue(provider().validateToken(LEGACY_TOKEN));
        assertEquals(Long.valueOf(7), provider().getUserIdFromToken(LEGACY_TOKEN));
    }

    @Test
    void malformedAndEmptyTokensAreRejected() {
        assertFalse(provider().validateToken("not-a-jwt"));
        assertFalse(provider().validateToken(""));
        assertFalse(provider().validateToken(null));
    }

    @Test
    void expiredTokenIsRejected() throws Exception {
        assertFalse(provider().validateToken(token("7", 1, "HS512", Base64.getDecoder().decode(SECRET))));
    }

    @Test
    void signatureUsingRawSecretInsteadOfLegacyDecodedKeyIsRejected() throws Exception {
        assertFalse(provider().validateToken(token("7", 4102444800L, "HS512", SECRET.getBytes(StandardCharsets.UTF_8))));
    }

    @Test
    void nonNumericSubjectCannotBecomeAnAccountId() throws Exception {
        String token = token("not-an-account-id", 4102444800L, "HS512", Base64.getDecoder().decode(SECRET));
        assertFalse(provider().validateToken(token));
        assertThrows(RuntimeException.class, () -> provider().getUserIdFromToken(token));
    }

    @Test
    void signedHs256TokenIsNotAcceptedAsAnAccountToken() throws Exception {
        String token = token("7", 4102444800L, "HS256", Base64.getDecoder().decode(SECRET));
        assertFalse(provider().validateToken(token));
        assertThrows(RuntimeException.class, () -> provider().getUserIdFromToken(token));
    }

    @Test
    void invalidAccountSubjectsAreRejectedBeforeAuthentication() throws Exception {
        for (String subject : new String[]{"", "0", "-1", "+7", " 7", "7.0", "9223372036854775808"}) {
            String token = token(subject, 4102444800L, "HS512", Base64.getDecoder().decode(SECRET));
            assertFalse(provider().validateToken(token), "Rejected subject: " + subject);
            assertThrows(RuntimeException.class, () -> provider().getUserIdFromToken(token));
        }
    }

    @Test
    void missingAccountSubjectOrExpirationIsRejected() throws Exception {
        for (String claims : new String[]{"{\"exp\":4102444800}", "{\"sub\":\"7\"}"}) {
            String token = signedClaims(claims, "HS512", Base64.getDecoder().decode(SECRET));
            assertFalse(provider().validateToken(token));
            assertThrows(RuntimeException.class, () -> provider().getUserIdFromToken(token));
        }
    }

    @Test
    void newlyIssuedTokenRoundTripsWithHs512SubjectAndConfiguredLifetime() throws Exception {
        User user = new User();
        user.setId(7L);
        user.setEmail("synthetic@startrack.test");
        var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        LocalUser principal = new LocalUser(user.getEmail(), "Synthetic", "User", "synthetic-password",
                true, false, true, true, true, authorities, user);
        TokenProvider provider = provider();
        long before = System.currentTimeMillis() / 1000;
        String token = provider.createToken(new UsernamePasswordAuthenticationToken(principal, null, authorities));
        long after = System.currentTimeMillis() / 1000;
        assertTrue(provider.validateToken(token));
        assertEquals(Long.valueOf(7), provider.getUserIdFromToken(token));
        String[] parts = token.split("\\.");
        var header = JsonParser.parseString(new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8)).getAsJsonObject();
        var payload = JsonParser.parseString(new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8)).getAsJsonObject();
        assertEquals("HS512", header.get("alg").getAsString());
        assertEquals("7", payload.get("sub").getAsString());
        assertTrue(payload.get("iat").getAsLong() >= before && payload.get("iat").getAsLong() <= after);
        assertEquals(60, payload.get("exp").getAsLong() - payload.get("iat").getAsLong());
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(Base64.getDecoder().decode(SECRET), "HmacSHA512"));
        assertArrayEquals(mac.doFinal((parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII)),
                Base64.getUrlDecoder().decode(parts[2]));
    }

    static String token(String subject, long expiration, String algorithm, byte[] key) throws Exception {
        return signedClaims("{\"sub\":\"" + subject + "\",\"iat\":1700000000,\"exp\":" + expiration + "}", algorithm, key);
    }

    private static String signedClaims(String claims, String algorithm, byte[] key) throws Exception {
        Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        String header = encoder.encodeToString(("{\"alg\":\"" + algorithm + "\"}").getBytes(StandardCharsets.UTF_8));
        String payload = encoder.encodeToString(claims.getBytes(StandardCharsets.UTF_8));
        String input = header + "." + payload;
        Mac mac = Mac.getInstance("HS256".equals(algorithm) ? "HmacSHA256" : "HmacSHA512");
        mac.init(new SecretKeySpec(key, mac.getAlgorithm()));
        return input + "." + encoder.encodeToString(mac.doFinal(input.getBytes(StandardCharsets.US_ASCII)));
    }
}
