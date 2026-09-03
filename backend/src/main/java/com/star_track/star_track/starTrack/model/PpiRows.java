/**
 * PpiRows model class
 * Represents the database table 'ppiRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage PPI (Patient and Public Involvement) records.
 */

package com.star_track.star_track.starTrack.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Date;
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
@Table(name = "ppiRows", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'ppiRows' table in the 'starTrack' catalog and 'startrack' schema */
public class PpiRows extends HashSet<PpiRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    /* Maps this field to the 'id' column with type 'serial' */
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    /* Configures a sequence generator for auto-incrementing IDs */
    @NotNull // Ensures the ID field cannot be null
    private Long id;

    @Column(name = "ppiMeeting") // Maps to the 'ppiMeeting' column in the database
    @Temporal(TemporalType.TIMESTAMP) // Specifies that this field should be stored as a TIMESTAMP
    protected Date ppiMeeting;

    @Column(name = "ppiContact") // Maps to the 'ppiContact' column in the database
    private String ppiContact;

    @Column(name = "ppiGroup") // Maps to the 'ppiGroup' column in the database
    private String ppiGroup;

    @Column(name = "ppiOutcome") // Maps to the 'ppiOutcome' column in the database
    private String ppiOutcome;

    @ManyToMany(
            fetch = FetchType.LAZY,  // Uses lazy loading for performance optimization
            mappedBy = "ppiRows", // Inverse side of the relationship defined in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity for this relationship
            cascade = CascadeType.ALL // Enables cascading of all operations (persist, merge, remove, etc.)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with ProjectCreate entity
}
