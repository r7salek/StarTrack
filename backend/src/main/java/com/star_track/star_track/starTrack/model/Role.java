/**
 * Role model class
 * Represents the database table 'roles' in the 'starTrack' schema.
 * This class is responsible for managing user roles and their associations with users.
 */

package com.star_track.star_track.starTrack.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.*;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.Set;

// Lombok annotations to reduce boilerplate code
@NoArgsConstructor    // Generates a no-argument constructor
@Entity               // Marks this class as a JPA entity
@Getter               // Generates getter methods for all fields
@Setter               // Generates setter methods for all fields
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id"   // Prevents circular references during serialization
)
@Table(name = "roles", catalog = "starTrack", schema = "startrack")
/* Maps the class to the 'roles' table in the 'starTrack' catalog and 'startrack' schema */
public class Role implements Serializable {

    // Constants for role names
    public static final String USER = "USER";
    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";

    private static final long serialVersionUID = 1L;

    @Id // Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Specifies auto-generation of the ID
    private long id;

    @Column(name = "name") // Maps to the 'name' column in the database
    private String name;

    @ManyToMany(
            fetch = FetchType.LAZY, // Uses lazy loading for better performance
            mappedBy = "roles", // Inverse side of the relationship defined in User
            targetEntity = User.class, // Specifies the target entity for this relationship
            cascade = {CascadeType.PERSIST, CascadeType.DETACH, CascadeType.MERGE, CascadeType.REFRESH}
    )
    private Set<User> users; // Many-to-Many relationship with User entity

    /**
     * Constructor to initialize the role with a name.
     *
     * @param name the name of the role
     */
    public Role(String name) {
        this.name = name;
    }

    // Getters and setters
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * Overrides the default toString method to provide a custom string representation.
     *
     * @return string representation of the Role object
     */
    @Override
    public String toString() {
        return "Role{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", users=" + users +
                '}';
    }
}
