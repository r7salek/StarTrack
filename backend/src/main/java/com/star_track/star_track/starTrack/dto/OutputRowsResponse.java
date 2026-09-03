/**
 * OutputRowsResponse DTO (Data Transfer Object) class
 * Used for inserting and retrieving data related to outputs.
 * Represents details about outputs, including descriptions, quantities, and confirmation status.
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
public class OutputRowsResponse {

    // Fields representing output data

    /**
     * Unique identifier for the output row record.
     * Used to identify specific outputs in the system.
     */
    private Long id;

    /**
     * Description or title of the output.
     * Represents the key deliverable or result associated with the record.
     */
    private String output;

    /**
     * Confirmation status of the output.
     * Indicates whether the output has been validated or approved.
     */
    private String confirmation;

    /**
     * Quantity or number of outputs produced.
     * Represents the measurable count of the output.
     */
    private Long outputQuantity;

    /**
     * Detailed description of the output.
     * Provides additional context or explanation about the output.
     */
    private String output_description;
}
