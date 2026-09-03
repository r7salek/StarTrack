/**
 * SubContractorsRows model class
 * Represents the database table 'subContractorsRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage subcontractor records.
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
@Table(name = "subContractorsRows", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'subContractorsRows' table in the 'starTrack' catalog and 'startrack' schema */
public class SubContractorsRows extends HashSet<SubContractorsRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    /* Maps this field to the 'id' column with type 'serial' */
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    /* Configures a sequence generator for auto-incrementing IDs */
    @NotNull // Ensures the ID field cannot be null
    private Long id;

    @JsonProperty("subContractorsName") // Maps JSON property 'subContractorsName' to this field
    @Column(name = "subContractorsName") // Maps this field to the 'subContractorsName' column
    private String subContractorsName;

    @JsonProperty("subContractorsEmail") // Maps JSON property 'subContractorsEmail' to this field
    @Column(name = "subContractorsEmail") // Maps this field to the 'subContractorsEmail' column
    private String subContractorsEmail;

    @JsonProperty("subContractorsExpertise") // Maps JSON property 'subContractorsExpertise' to this field
    @Column(name = "subContractorsExpertise") // Maps this field to the 'subContractorsExpertise' column
    private String subContractorsExpertise;

    @JsonProperty("subContractorsOrganisation") // Maps JSON property 'subContractorsOrganisation' to this field
    @Column(name = "subContractorsOrganisation") // Maps this field to the 'subContractorsOrganisation' column
    private String subContractorsOrganisation;

    @JsonProperty("subContractorsOtherInfo") // Maps JSON property 'subContractorsOtherInfo' to this field
    @Column(name = "subContractorsOtherInfo") // Maps this field to the 'subContractorsOtherInfo' column
    private String subContractorsOtherInfo;

    @ManyToMany(
            fetch = FetchType.LAZY, // Uses lazy loading for performance optimization
            mappedBy = "subContractorsRows", // Inverse side of the relationship defined in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity for this relationship
            cascade = CascadeType.ALL // Enables cascading of all operations (persist, merge, remove, etc.)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with ProjectCreate entity
}
