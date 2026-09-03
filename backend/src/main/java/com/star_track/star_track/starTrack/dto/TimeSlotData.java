/**
 * TimeSlotData DTO (Data Transfer Object) class
 * Represents a time slot with a description field.
 * Used for transferring or handling data related to time slots in a structured manner.
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
public class TimeSlotData {

    /**
     * Description of the time slot.
     * Used to provide details or context about the time slot (e.g., its purpose or scope).
     */
    private String description;
}
