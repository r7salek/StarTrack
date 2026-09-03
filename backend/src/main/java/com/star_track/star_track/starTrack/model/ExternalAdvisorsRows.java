/**
 * ExternalAdvisorsRows model class
 * Represents the database table 'externalAdvisorsRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage external advisors.
 */

package com.star_track.star_track.starTrack.model;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

// Lombok annotations for reducing boilerplate code
@NoArgsConstructor // Generates a no-argument constructor
@Data              // Combines @ToString, @EqualsAndHashCode, @Getter, @Setter, and @RequiredArgsConstructor
@Entity            // Marks this class as a JPA entity
@Getter            // Generates getter methods for all fields
@Setter            // Generates setter methods for all fields
@AllArgsConstructor // Generates a constructor with all arguments
@ToString          // Generates a toString() method
@Table(name = "externalAdvisorsRows", catalog = "starTrack", schema = "startrack")
// Maps the class to the 'externalAdvisorsRows' table in the 'starTrack' catalog and 'startrack' schema
public class ExternalAdvisorsRows extends HashSet<ExternalAdvisorsRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    // Maps this field to the 'id' column, with type 'serial' in the database
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    // Configures a sequence generator for generating unique IDs
    @NotNull // Ensures the ID field cannot be null
    private Long id;

    @Column(name = "externalAdvisorsMeeting") // Maps this field to the 'externalAdvisorsMeeting' column
    @Temporal(TemporalType.TIMESTAMP)
    // Specifies that this field represents a timestamp in the database
    protected Date externalAdvisorsMeeting;

    @Column(name = "externalAdvisorsOrganisation") // Maps this field to the 'externalAdvisorsOrganisation' column
    private String externalAdvisorsOrganisation;

    @Column(name = "externalAdvisorsName") // Maps this field to the 'externalAdvisorsName' column
    private String externalAdvisorsName;

    @Column(name = "externalAdvisorsEmail") // Maps this field to the 'externalAdvisorsEmail' column
    private String externalAdvisorsEmail;

    @Column(name = "externalAdvisorsOutcome") // Maps this field to the 'externalAdvisorsOutcome' column
    private String externalAdvisorsOutcome;

    @Column(name = "externalAdvisorsExpertise") // Maps this field to the 'externalAdvisorsExpertise' column
    private String externalAdvisorsExpertise;

    @ManyToMany(
            fetch = FetchType.LAZY, // Configures lazy loading for better performance
            mappedBy = "externalAdvisorsRows", // Maps the relationship to the 'externalAdvisorsRows' field in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity for this relationship
            cascade = CascadeType.ALL // Enables cascading operations (persist, merge, remove)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with the ProjectCreate entity
}
