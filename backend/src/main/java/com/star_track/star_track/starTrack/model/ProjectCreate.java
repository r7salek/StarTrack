/**
 * ProjectCreate model class
 * Represents the database table 'projectCreate' in the 'starTrack' schema.
 * This class is used to interact with the database and manage project records.
 */

package com.star_track.star_track.starTrack.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.*;

import javax.persistence.*;
import java.util.Date;
import java.util.Set;

// Lombok annotations for reducing boilerplate code
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@Entity               // Marks this class as a JPA entity
@Getter               // Generates getter methods for all fields
@Setter               // Generates setter methods for all fields
@AllArgsConstructor   // Generates an all-arguments constructor
@ToString             // Generates a toString() method
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"   // Prevents circular references during serialization
)
@Table(name = "projectCreate", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'projectCreate' table in the 'starTrack' catalog and 'startrack' schema */
public class ProjectCreate {

    // Project status constants
    public static final String SUBMITTED = "SUBMITTED";
    public static final String ACCEPTED = "ACCEPTED";
    public static final String REJECTED = "REJECTED";
    public static final String CLOSED = "CLOSED";

    private static final long serialVersionUID = 1L;

    @Id // Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Specifies auto-generation of the ID
    @Column(nullable = false, updatable = false) // Ensures the ID is non-null and immutable
    private Long id;

    @Column(name = "projectName") // Maps to the 'projectName' column
    private String projectName;

    @Column(name = "created_date", updatable = false) // Maps to the 'created_date' column
    @Temporal(TemporalType.TIMESTAMP) // Specifies the temporal type as TIMESTAMP
    protected Date createdDate;

    @JoinColumn(name = "apply_user", referencedColumnName = "email") // Maps foreign key to the 'email' column in User
    @ManyToOne(
            fetch = FetchType.LAZY,
            targetEntity = User.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JsonManagedReference
    private User applyUser;

    @JoinColumn(name = "modify_user", referencedColumnName = "email") // Maps foreign key to the 'email' column in User
    @ManyToOne(
            fetch = FetchType.LAZY,
            targetEntity = User.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JsonManagedReference
    private User modifyUser;

    // PI (Principal Investigator) information
    @Column(name = "lastNamePI")
    private String lastNamePI;

    @Column(name = "firstNamePI")
    private String firstNamePI;

    @Column(name = "emailPI")
    private String emailPI;

    @Column(name = "departmentPI")
    private String departmentPI;

    @Column(name = "crsidPI")
    private String crsidPI;

    @Column(name = "otherInforPI")
    private String otherInforPI;

    // Contract details
    @Column(name = "ttoContractName")
    private String ttoContractName;

    @Column(name = "ttoContractEmail")
    private String ttoContractEmail;

    @Column(name = "ttoContractOtherInfo")
    private String ttoContractOtherInfo;

    // Scope information
    @Column(name = "modality")
    private String modality;

    @Column(name = "modalityOther")
    private String modalityOther;

    @Column(name = "areaOfExpertise")
    private String areaOfExpertise;

    @Column(name = "areaOfExpertiseOther")
    private String areaOfExpertiseOther;

    @Column(name = "readiness")
    private String readiness;

    @Column(name = "projectBackground", columnDefinition = "TEXT") // Large text content for project background
    private String projectBackground;

    @Column(name = "briefDescription", columnDefinition = "TEXT") // Large text content for brief description
    private String briefDescription;

    // Relationships with other entities
    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = GroupMemberRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_groupMemberRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "groupMemberRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<GroupMemberRows> groupMemberRows;

    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = OutputRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_outputRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "outputRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<OutputRows> outputRows;

    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = CollaborationRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_collaborationRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "collaborationRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<CollaborationRows> collaborationRows;

    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = ExternalAdvisorsRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_externalAdvisorsRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "externalAdvisorsRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<ExternalAdvisorsRows> externalAdvisorsRows;

    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = SubContractorsRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_subContractorsRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "subContractorsRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<SubContractorsRows> subContractorsRows;

    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = PpiRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_ppiRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "ppiRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<PpiRows> ppiRows;

    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = OtrRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_otrRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "otrRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<OtrRows> otrRows;

    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = FundingRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_fundingRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "fundingRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<FundingRows> fundingRows;

    @ManyToMany(
            fetch = FetchType.LAZY,
            targetEntity = FundingOverviewRows.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JsonIgnore
    @JoinTable(
            name = "projectCreate_fundingOverviewRows",
            joinColumns = {@JoinColumn(name = "projectCreate_id")},
            inverseJoinColumns = {@JoinColumn(name = "fundingOverviewRows_id")},
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<FundingOverviewRows> fundingOverviewRows;

    @Column(name = "apply_value") // Maps to the 'apply_value' column
    private String applyValue;

    public ProjectCreate() {
        // Default constructor
    }
}
