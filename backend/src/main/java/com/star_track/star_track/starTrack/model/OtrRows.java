/**
 * OtrRows model class
 * Represents the database table 'otrRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage OTR (Off-The-Record) team member records.
 */

package com.star_track.star_track.starTrack.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

// Lombok annotations for reducing boilerplate code
@NoArgsConstructor    // Generates a no-argument constructor
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@Entity               // Marks this class as a JPA entity
@Getter               // Generates getter methods for all fields
@Setter               // Generates setter methods for all fields
@AllArgsConstructor   // Generates an all-arguments constructor
@ToString             // Generates a toString() method
@Table(name = "otrRows", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'otrRows' table in the 'starTrack' catalog and 'startrack' schema */
public class OtrRows extends HashSet<OtrRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    /* Maps this field to the 'id' column with type 'serial' */
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    /* Configures a sequence generator for auto-incrementing IDs */
    @NotNull // Ensures the ID field cannot be null
    private Long id;

    @Column(name = "otrTeamMember") // Maps to the 'otrTeamMember' column in the database
    private String otrTeamMember;

    @Column(name = "otrRole") // Maps to the 'otrRole' column in the database
    private String otrRole;

    @Column(name = "otrFunding") // Maps to the 'otrFunding' column in the database
    private String otrFunding;

    @Column(name = "otrDate") // Maps to the 'otrDate' column in the database
    @Temporal(TemporalType.TIMESTAMP) // Specifies that this field should be stored as a TIMESTAMP
    protected Date otrDate;

    @Column(name = "otrOtherInfo") // Maps to the 'otrOtherInfo' column in the database
    private String otrOtherInfo;

    @ManyToMany(
            fetch = FetchType.LAZY,  // Uses lazy loading for performance optimization
            mappedBy = "otrRows", // Inverse side of the relationship defined in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity for this relationship
            cascade = CascadeType.ALL // Enables cascading of all operations (persist, merge, remove, etc.)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with ProjectCreate entity
}
