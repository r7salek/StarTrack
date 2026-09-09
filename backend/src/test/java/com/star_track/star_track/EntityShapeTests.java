package com.star_track.star_track;

import com.star_track.star_track.starTrack.model.*;
import org.junit.jupiter.api.Test;
import jakarta.validation.Validation;

import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EntityShapeTests {
    private static final List<Class<?>> CHILD_ENTITIES = List.of(CollaborationRows.class, ExternalAdvisorsRows.class,
            FundingOverviewRows.class, FundingRows.class, GroupMemberRows.class,
            OtrRows.class, OutputRows.class, PpiRows.class, SubContractorsRows.class);

    @Test
    void childRecordsAreEntitiesNotJdkCollections() {
        for (Class<?> entity : CHILD_ENTITIES) {
            assertFalse(Collection.class.isAssignableFrom(entity), entity.getSimpleName());
        }
    }

    @Test
    void newChildEntitiesDoNotRequireDatabaseGeneratedIdsBeforeInsertion() throws Exception {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            for (Class<?> entity : CHILD_ENTITIES) {
                assertTrue(factory.getValidator().validate(entity.getDeclaredConstructor().newInstance()).isEmpty(),
                        entity.getSimpleName());
            }
        }
    }
}
