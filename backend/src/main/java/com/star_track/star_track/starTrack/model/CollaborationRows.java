/**
 * CollaborationRows model class
 * Represents the database table 'collaborationRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage collaborations.
 */

package com.star_track.star_track.starTrack.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

// Lombok annotations for boilerplate code reduction
@NoArgsConstructor // Generates a no-argument constructor
@Data              // Generates getter, setter, toString, equals, and hashCode methods
@Entity            // Marks this class as a JPA entity
@Getter            // Generates getter methods for all fields
@Setter            // Generates setter methods for all fields
@AllArgsConstructor // Generates a constructor with all arguments
@ToString          // Generates a toString() method
@Table(name = "collaborationRows", catalog = "starTrack", schema = "startrack")
// Maps the class to the 'collaborationRows' table in the 'starTrack' catalog and 'startrack' schema
public class CollaborationRows extends HashSet<CollaborationRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    // Maps this field to the 'id' column, with type 'serial' in the database
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    // Configures the sequence generator for ID generation
    @NotNull // Validates that the ID field cannot be null
    private Long id;

    @JsonProperty("collaboration") // Maps JSON property 'collaboration' to this field
    @Column(name = "collaboration") // Maps this field to the 'collaboration' column
    private String collaboration;

    @JsonProperty("collaborationName") // Maps JSON property 'collaborationName' to this field
    @Column(name = "collaborationName") // Maps this field to the 'collaborationName' column
    private String collaborationName;

    @JsonProperty("collaborationEmail") // Maps JSON property 'collaborationEmail' to this field
    @Column(name = "collaborationEmail") // Maps this field to the 'collaborationEmail' column
    private String collaborationEmail;

    @JsonProperty("collaborationLocation") // Maps JSON property 'collaborationLocation' to this field
    @Column(name = "collaborationLocation") // Maps this field to the 'collaborationLocation' column
    private String collaborationLocation;

    @JsonProperty("collaborationOtherInfo") // Maps JSON property 'collaborationOtherInfo' to this field
    @Column(name = "collaborationOtherInfo") // Maps this field to the 'collaborationOtherInfo' column
    private String collaborationOtherInfo;

    @ManyToMany(
            fetch = FetchType.LAZY, // Configures lazy loading for performance optimization
            mappedBy = "collaborationRows", // Maps this relationship to the 'collaborationRows' field in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity of the relationship
            cascade = CascadeType.ALL // Configures cascading operations (e.g., persist, merge, remove)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with the ProjectCreate entity
}
