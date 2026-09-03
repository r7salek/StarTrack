/**
 * User model class
 * Represents the database table 'user' in the 'starTrack' schema.
 * This class is used to manage user-related data and interactions with the database.
 */

package com.star_track.star_track.starTrack.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.Objects;
import java.util.Set;

// Lombok annotations to reduce boilerplate code
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
@Table(name = "user", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'user' table in the 'starTrack' catalog and schema */
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    // Timestamp fields
    @Column(name = "created_date", updatable = false) // Maps to the 'created_date' column
    @Temporal(TemporalType.TIMESTAMP) // Specifies the temporal type as TIMESTAMP
    protected Date createdDate;

    @Column(name = "modified_date") // Maps to the 'modified_date' column
    @Temporal(TemporalType.TIMESTAMP) // Specifies the temporal type as TIMESTAMP
    protected Date modifiedDate;

    // Primary key
    @Id // Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Specifies auto-generation of the ID
    @Column(nullable = false, updatable = false) // Ensures the ID is non-null and immutable
    private Long id;

    // User details
    @Column(name = "first_name") // Maps to the 'first_name' column
    private String firstName;

    @Column(name = "last_name") // Maps to the 'last_name' column
    private String lastName;

    @Column(name = "email") // Maps to the 'email' column
    private String email;

    @Column(name = "password") // Maps to the 'password' column
    private String password;

    @Column(name = "delete") // Indicates whether the user is marked for deletion
    private boolean delete;

    @Column(name = "enabled") // Indicates whether the user account is enabled
    private boolean enabled;

    @Column(name = "provider") // Indicates the authentication provider
    private String provider;

    @Column(name = "provider_user_id") // Stores the user ID from the authentication provider
    private String providerUserId;

    // Roles relationship
    @JsonIgnore // Prevents serialization of roles to avoid circular references
    @ManyToMany(
            fetch = FetchType.LAZY, // Uses lazy loading for performance optimization
            targetEntity = Role.class,
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    @JoinTable(
            name = "user_roles",
            joinColumns = {@JoinColumn(name = "user_id")}, // Maps user ID to the 'user_roles' table
            inverseJoinColumns = {@JoinColumn(name = "role_id")}, // Maps role ID to the 'user_roles' table
            catalog = "starTrack",
            schema = "startrack"
    )
    private Set<Role> roles;

    // Constructors
    public User() {
        // Default constructor
    }

    public User(Date createdDate, Date modifiedDate, Long id, String firstName, String lastName, String email, String password, boolean delete, boolean enabled, String provider) {
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.delete = delete;
        this.enabled = enabled;
        this.provider = provider;
    }

    // Custom toString method
    @Override
    public String toString() {
        return "User{" +
                "createdDate=" + createdDate +
                ", modifiedDate=" + modifiedDate +
                ", id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", delete=" + delete +
                ", enabled=" + enabled +
                ", provider='" + provider + '\'' +
                ", providerUserId='" + providerUserId + '\'' +
                ", roles=" + roles +
                '}';
    }
}
