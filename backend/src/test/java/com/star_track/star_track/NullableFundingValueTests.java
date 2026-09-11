package com.star_track.star_track;

import com.star_track.star_track.starTrack.dto.*;
import com.star_track.star_track.starTrack.model.FundingOverviewRows;
import com.star_track.star_track.starTrack.model.FundingRows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.BeanUtils;
import tools.jackson.databind.json.JsonMapper;

import java.util.Arrays;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/** V1 permits SQL NULL funding amounts; unknown must not become zero or a 500. */
class NullableFundingValueTests {
    static Stream<Arguments> nullableFields() {
        return Stream.of(Arguments.of(FundingRows.class, "value"),
                Arguments.of(FundingOverviewRows.class, "valueOverview"),
                Arguments.of(FundingRowsByID.class, "value"),
                Arguments.of(FundingRowsResponse.class, "value"),
                Arguments.of(FundingOverviewRowsByID.class, "valueOverview"),
                Arguments.of(FundingOverviewRowsResponse.class, "valueOverview"),
                Arguments.of(ProjectDataResponse.class, "valueOverview"));
    }

    @ParameterizedTest
    @MethodSource("nullableFields")
    void nullableDatabaseAmountRemainsNullableInEveryLayer(Class<?> type, String name) throws Exception {
        var field = type.getDeclaredField(name);
        assertEquals(Integer.class, field.getType(), type.getSimpleName() + "." + name);
        field.setAccessible(true);
        var instance = type.getDeclaredConstructor().newInstance();
        assertNull(field.get(instance), "Unknown value must remain null");
        field.set(instance, 0);
        assertEquals(0, field.get(instance), "Explicit zero remains distinct from unknown");
        field.set(instance, null);
        assertNull(field.get(instance));
    }

    static Stream<Class<?>> projections() {
        return Stream.of(FundingRowsByID.class, FundingOverviewRowsByID.class);
    }

    @ParameterizedTest
    @MethodSource("projections")
    void jpqlConstructorAcceptsNullableLegacyColumns(Class<?> projection) {
        var constructor = Arrays.stream(projection.getDeclaredConstructors())
                .filter(candidate -> candidate.getParameterCount() > 0).findFirst().orElseThrow();
        assertDoesNotThrow(() -> constructor.newInstance(new Object[constructor.getParameterCount()]),
                "Nullable SQL columns must be accepted by the JPQL projection constructor");
    }

    @Test
    void summaryCopyAndJsonPreserveNullWithoutChangingKnownNumbers() {
        var mapper = JsonMapper.builder().build();
        var overview = new FundingOverviewRowsByID();
        var summary = new ProjectDataResponse();
        BeanUtils.copyProperties(overview, summary, "id");
        var unknown = mapper.readTree(mapper.writeValueAsString(summary));
        assertTrue(unknown.has("valueOverview"));
        assertTrue(unknown.get("valueOverview").isNull());
        overview.setValueOverview(456);
        BeanUtils.copyProperties(overview, summary, "id");
        assertEquals(456, mapper.readTree(mapper.writeValueAsString(summary)).get("valueOverview").intValue());
        var request = mapper.readValue("{\"value\":null}", FundingRowsResponse.class);
        assertNull(request.getValue(), "Explicit input null must not become zero");
    }
}
