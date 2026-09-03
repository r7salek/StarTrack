/**
 * FundingRows model class
 * Represents the database table 'fundingRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage funding records.
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
@Data                 // Generates getter, setter, equals, hashCode, and toString methods
@Entity               // Marks this class as a JPA entity
@Getter               // Generates getter methods for all fields
@Setter               // Generates setter methods for all fields
@AllArgsConstructor   // Generates an all-arguments constructor
@ToString             // Generates a toString() method
@Table(name = "fundingRows", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'fundingRows' table in the 'starTrack' catalog and 'startrack' schema */
public class FundingRows extends HashSet<FundingRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    /* Maps this field to the 'id' column with type 'serial' */
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    /* Configures a sequence generator for auto-incrementing IDs */
    @NotNull // Ensures the ID field cannot be null
    private Long id;

    @Column(name = "funding") // Maps to the 'funding' column in the database
    private String funding;

    @Column(name = "fundingOther") // Maps to the 'fundingOther' column in the database
    private String fundingOther;

    @Column(name = "fundingNIHR") // Maps to the 'fundingNIHR' column in the database
    private String fundingNIHR;

    @Column(name = "fundingNIHROther") // Maps to the 'fundingNIHROther' column in the database
    private String fundingNIHROther;

    @Column(name = "fundingUKRIMRC") // Maps to the 'fundingUKRIMRC' column in the database
    private String fundingUKRIMRC;

    @Column(name = "fundingUKRIMRCOther") // Maps to the 'fundingUKRIMRCOther' column in the database
    private String fundingUKRIMRCOther;

    @Column(name = "fundingWellcomeTrust") // Maps to the 'fundingWellcomeTrust' column in the database
    private String fundingWellcomeTrust;

    @Column(name = "fundingWellcomeTrustOther") // Maps to the 'fundingWellcomeTrustOther' column in the database
    private String fundingWellcomeTrustOther;

    @Column(name = "scheme") // Maps to the 'scheme' column in the database
    private String scheme;

    @Column(name = "schemeOther") // Maps to the 'schemeOther' column in the database
    private String schemeOther;

    @Column(name = "value") // Maps to the 'value' column in the database
    private int value;

    @Column(name = "fundingStartDate") // Maps to the 'fundingStartDate' column in the database
    @Temporal(TemporalType.TIMESTAMP) // Specifies the temporal type as TIMESTAMP
    protected Date fundingStartDate;

    @Column(name = "fundingEndDate") // Maps to the 'fundingEndDate' column in the database
    @Temporal(TemporalType.TIMESTAMP) // Specifies the temporal type as TIMESTAMP
    protected Date fundingEndDate;

    @Column(name = "aims", columnDefinition = "TEXT")
    /* Maps to the 'aims' column with a TEXT data type for larger text content */
    private String aims;

    @Column(name = "grantNumber") // Maps to the 'grantNumber' column in the database
    private String grantNumber;

    @Column(name = "worktribeNumber") // Maps to the 'worktribeNumber' column in the database
    private String worktribeNumber;

    @ManyToMany(
            fetch = FetchType.LAZY,  // Uses lazy loading for performance optimization
            mappedBy = "fundingRows", // Inverse side of the relationship defined in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity for this relationship
            cascade = CascadeType.ALL // Enables cascading of all operations (persist, merge, remove, etc.)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with ProjectCreate entity
}
