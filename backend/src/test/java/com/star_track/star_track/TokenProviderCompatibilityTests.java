package com.star_track.star_track;

import com.star_track.star_track.starTrack.registration.config.AppProperties;
import com.star_track.star_track.starTrack.registration.security.jwt.TokenProvider;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

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
        assertThrows(RuntimeException.class, () -> provider().getUserIdFromToken(token));
    }

    static String token(String subject, long expiration, String algorithm, byte[] key) throws Exception {
        Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        String header = encoder.encodeToString(("{\"alg\":\"" + algorithm + "\"}").getBytes(StandardCharsets.UTF_8));
        String payload = encoder.encodeToString(("{\"sub\":\"" + subject + "\",\"iat\":1700000000,\"exp\":" + expiration + "}").getBytes(StandardCharsets.UTF_8));
        String input = header + "." + payload;
        Mac mac = Mac.getInstance("HS256".equals(algorithm) ? "HmacSHA256" : "HmacSHA512");
        mac.init(new SecretKeySpec(key, mac.getAlgorithm()));
        return input + "." + encoder.encodeToString(mac.doFinal(input.getBytes(StandardCharsets.US_ASCII)));
    }
}
