/**
 * OutputRows model class
 * Represents the database table 'outputRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage output records.
 */

package com.star_track.star_track.starTrack.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

// Lombok annotations to reduce boilerplate code
@NoArgsConstructor    // Generates a no-argument constructor
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@Entity               // Marks this class as a JPA entity
@Getter               // Generates getter methods for all fields
@Setter               // Generates setter methods for all fields
@AllArgsConstructor   // Generates an all-arguments constructor
@ToString             // Generates a toString() method
@Table(name = "outputRows", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'outputRows' table in the 'starTrack' catalog and 'startrack' schema */
public class OutputRows extends HashSet<OutputRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    /* Maps this field to the 'id' column with type 'serial' */
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    /* Configures a sequence generator for auto-incrementing IDs */
    @NotNull // Ensures the ID field cannot be null
    private Long id;

    @JsonProperty("output") // Maps JSON property 'output' to this field
    @Column(name = "output") // Maps this field to the 'output' column
    private String output;

    @Column(name = "confirmation") // Maps this field to the 'confirmation' column
    private String confirmation;

    @Column(name = "outputQuantity") // Maps this field to the 'outputQuantity' column
    private Long outputQuantity;

    @JsonProperty("output_description") // Maps JSON property 'output_description' to this field
    @Column(name = "output_description", columnDefinition = "TEXT") // Maps this field to the 'output_description' column
    private String output_description;

    @ManyToMany(
            fetch = FetchType.LAZY,  // Uses lazy loading for performance optimization
            mappedBy = "outputRows", // Inverse side of the relationship defined in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity for this relationship
            cascade = CascadeType.ALL // Enables cascading of all operations (persist, merge, remove, etc.)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with ProjectCreate entity
}
