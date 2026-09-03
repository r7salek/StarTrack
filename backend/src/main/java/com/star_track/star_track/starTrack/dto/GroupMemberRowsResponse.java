/**
 * GroupMemberRowsResponse DTO (Data Transfer Object) class
 * Used for transferring data related to group members (e.g., Postdocs) in a structured format.
 * Represents details about group members for response purposes.
 */

package com.star_track.star_track.starTrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

// Lombok annotations to reduce boilerplate code
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@AllArgsConstructor   // Generates an all-arguments constructor
@NoArgsConstructor    // Generates a no-argument constructor
@ToString             // Generates a toString() method
public class GroupMemberRowsResponse {

    // Fields representing group member data

    /**
     * Unique identifier for the group member record.
     * Used to identify a specific group member in the system.
     */
    private Long id;

    /**
     * Last name of the group member (Postdoc).
     * Helps distinguish individuals within the group.
     */
    private String lastNamePostDoc;

    /**
     * First name of the group member (Postdoc).
     * Complements the last name to provide a full name.
     */
    private String firstNamePostDoc;

    /**
     * Email address of the group member (Postdoc).
     * Used for communication and correspondence.
     */
    private String emailPostDoc;

    /**
     * Department associated with the group member (Postdoc).
     * Represents the organizational unit or division where the member works.
     */
    private String departmentPostDoc;

    /**
     * Position held by the group member (Postdoc).
     * Indicates the role or title of the member within the group.
     */
    private String positionPostDoc;

    /**
     * CRSID (Common Registration Service Identifier) for the group member (Postdoc).
     * Used for system identification or organizational records.
     */
    private String crsidPostDoc;

    /**
     * Additional information about the group member (Postdoc).
     * Used to capture supplementary details not covered by other fields.
     */
    private String otherInforPostDoc;
}
