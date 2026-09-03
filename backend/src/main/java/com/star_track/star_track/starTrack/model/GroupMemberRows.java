/**
 * GroupMemberRows model class
 * Represents the database table 'groupMemberRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage group member records.
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
@Table(name = "groupMemberRows", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'groupMemberRows' table in the 'starTrack' catalog and 'startrack' schema */
public class GroupMemberRows extends HashSet<GroupMemberRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    /* Maps this field to the 'id' column with type 'serial' */
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    /* Configures a sequence generator for auto-incrementing IDs */
    @NotNull // Ensures the ID field cannot be null
    private Long id;

    @JsonProperty("lastNamePostDoc") // Maps JSON property 'lastNamePostDoc' to this field
    @Column(name = "lastNamePostDoc") // Maps this field to the 'lastNamePostDoc' column
    private String lastNamePostDoc;

    @JsonProperty("firstNamePostDoc") // Maps JSON property 'firstNamePostDoc' to this field
    @Column(name = "firstNamePostDoc") // Maps this field to the 'firstNamePostDoc' column
    private String firstNamePostDoc;

    @JsonProperty("emailPostDoc") // Maps JSON property 'emailPostDoc' to this field
    @Column(name = "emailPostDoc") // Maps this field to the 'emailPostDoc' column
    private String emailPostDoc;

    @JsonProperty("departmentPostDoc") // Maps JSON property 'departmentPostDoc' to this field
    @Column(name = "departmentPostDoc") // Maps this field to the 'departmentPostDoc' column
    private String departmentPostDoc;

    @JsonProperty("positionPostDoc") // Maps JSON property 'positionPostDoc' to this field
    @Column(name = "positionPostDoc") // Maps this field to the 'positionPostDoc' column
    private String positionPostDoc;

    @JsonProperty("crsidPostDoc") // Maps JSON property 'crsidPostDoc' to this field
    @Column(name = "crsidPostDoc") // Maps this field to the 'crsidPostDoc' column
    private String crsidPostDoc;

    @JsonProperty("otherInforPostDoc") // Maps JSON property 'otherInforPostDoc' to this field
    @Column(name = "otherInforPostDoc") // Maps this field to the 'otherInforPostDoc' column
    private String otherInforPostDoc;

    @ManyToMany(
            fetch = FetchType.LAZY,  // Uses lazy loading for performance optimization
            mappedBy = "groupMemberRows", // Inverse side of the relationship defined in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity for this relationship
            cascade = CascadeType.ALL // Enables cascading of all operations (persist, merge, remove, etc.)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with ProjectCreate entity
}
