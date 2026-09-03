/**
 * FundingOverviewRows model class
 * Represents the database table 'fundingOverviewRows' in the 'starTrack' schema.
 * This class is used to interact with the database and manage funding overview data.
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
@Table(name = "fundingOverviewRows", catalog = "starTrack", schema = "startrack")
// Maps the class to the 'fundingOverviewRows' table in the 'starTrack' catalog and 'startrack' schema
public class FundingOverviewRows extends HashSet<FundingOverviewRows> {

    @Id // Marks this field as the primary key
    @Column(name = "id", columnDefinition = "serial")
    // Maps this field to the 'id' column, with type 'serial' in the database
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "seq_name_generated_in_db")
    @SequenceGenerator(name = "seq_name_generated_in_db", sequenceName = "seq_name_generated_in_db", allocationSize = 1)
    // Configures a sequence generator for generating unique IDs
    @NotNull // Ensures the ID field cannot be null
    private Long id;

    @Column(name = "fundingOverview") // Maps this field to the 'fundingOverview' column
    private String fundingOverview;

    @Column(name = "fundingOverviewOther") // Maps this field to the 'fundingOverviewOther' column
    private String fundingOverviewOther;

    @Column(name = "fundingOverviewNIHR") // Maps this field to the 'fundingOverviewNIHR' column
    private String fundingOverviewNIHR;

    @Column(name = "fundingOverviewNIHROther") // Maps this field to the 'fundingOverviewNIHROther' column
    private String fundingOverviewNIHROther;

    @Column(name = "fundingOverviewUKRIMRC") // Maps this field to the 'fundingOverviewUKRIMRC' column
    private String fundingOverviewUKRIMRC;

    @Column(name = "fundingOverviewUKRIMRCOther") // Maps this field to the 'fundingOverviewUKRIMRCOther' column
    private String fundingOverviewUKRIMRCOther;

    @Column(name = "fundingOverviewWellcomeTrust") // Maps this field to the 'fundingOverviewWellcomeTrust' column
    private String fundingOverviewWellcomeTrust;

    @Column(name = "fundingOverviewWellcomeTrustOther") // Maps this field to the 'fundingOverviewWellcomeTrustOther' column
    private String fundingOverviewWellcomeTrustOther;

    @Column(name = "schemeOverview") // Maps this field to the 'schemeOverview' column
    private String schemeOverview;

    @Column(name = "schemeOverviewOther") // Maps this field to the 'schemeOverviewOther' column
    private String schemeOverviewOther;

    @Column(name = "valueOverview") // Maps this field to the 'valueOverview' column
    private int valueOverview; // Stores numerical data for funding value

    @Column(name = "fundingOverviewStartDate") // Maps this field to the 'fundingOverviewStartDate' column
    @Temporal(TemporalType.TIMESTAMP)
    // Specifies that this field represents a timestamp in the database
    protected Date fundingOverviewStartDate;

    @Column(name = "fundingOverviewEndDate") // Maps this field to the 'fundingOverviewEndDate' column
    @Temporal(TemporalType.TIMESTAMP)
    // Specifies that this field represents a timestamp in the database
    protected Date fundingOverviewEndDate;

    @Column(name = "aimsOverview", columnDefinition = "TEXT")
    // Maps this field to the 'aimsOverview' column, defined as 'TEXT' for large content
    private String aimsOverview;

    @Column(name = "grantNumberOverview") // Maps this field to the 'grantNumberOverview' column
    private String grantNumberOverview;

    @Column(name = "worktribeNumberOverview") // Maps this field to the 'worktribeNumberOverview' column
    private String worktribeNumberOverview;

    @ManyToMany(
            fetch = FetchType.LAZY, // Configures lazy loading for better performance
            mappedBy = "fundingOverviewRows", // Maps the relationship to the 'fundingOverviewRows' field in ProjectCreate
            targetEntity = ProjectCreate.class, // Specifies the target entity for this relationship
            cascade = CascadeType.ALL // Enables cascading operations (persist, merge, remove)
    )
    private Set<ProjectCreate> projectCreate; // Many-to-Many relationship with the ProjectCreate entity
}
