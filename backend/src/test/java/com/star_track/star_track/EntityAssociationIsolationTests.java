package com.star_track.star_track;

import com.star_track.star_track.starTrack.model.*;
import jakarta.persistence.ManyToMany;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.lang.reflect.Field;
import java.util.AbstractSet;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/** Scalar equality/logging must never initialize a bidirectional Hibernate collection. */
class EntityAssociationIsolationTests {
    private static final List<Class<?>> ENTITIES = List.of(ProjectCreate.class, GroupMemberRows.class,
            OutputRows.class, CollaborationRows.class, ExternalAdvisorsRows.class, SubContractorsRows.class,
            PpiRows.class, OtrRows.class, FundingRows.class, FundingOverviewRows.class);

    static Stream<Arguments> associationsAndOperations() {
        return ENTITIES.stream().flatMap(type -> Arrays.stream(type.getDeclaredFields())
                .filter(field -> field.isAnnotationPresent(ManyToMany.class))
                .flatMap(field -> Stream.of("equals", "hashCode", "toString")
                        .map(operation -> Arguments.of(type, field, operation))));
    }

    @ParameterizedTest(name = "{0}.{1}: {2} ignores the association")
    @MethodSource("associationsAndOperations")
    void generatedObjectMethodsDoNotTraverseAssociations(Class<?> type, Field association, String operation)
            throws Exception {
        Object first = type.getDeclaredConstructor().newInstance();
        Object second = type.getDeclaredConstructor().newInstance();
        association.setAccessible(true);
        association.set(first, new UninitializedAssociation());
        association.set(second, new UninitializedAssociation());

        switch (operation) {
            case "equals" -> assertTrue(assertDoesNotThrow(() -> first.equals(second)),
                    "Equal scalar state must not depend on lazy relationships");
            case "hashCode" -> assertDoesNotThrow(first::hashCode);
            case "toString" -> assertDoesNotThrow(first::toString);
            default -> fail("Unknown object operation");
        }
    }

    private static final class UninitializedAssociation extends AbstractSet<Object> {
        private AssertionError touched() {
            return new AssertionError("A generated object method traversed a lazy JPA association");
        }
        @Override public Iterator<Object> iterator() { throw touched(); }
        @Override public int size() { throw touched(); }
        @Override public boolean equals(Object other) { throw touched(); }
        @Override public int hashCode() { throw touched(); }
        @Override public String toString() { throw touched(); }
    }
}
