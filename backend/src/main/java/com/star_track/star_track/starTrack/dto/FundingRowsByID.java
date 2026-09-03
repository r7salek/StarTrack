/**
 * FundingRowsByID DTO (Data Transfer Object) class
 * Used for retrieving funding data by ID.
 * Represents detailed funding information for retrieval purposes.
 */

package com.star_track.star_track.starTrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Date;

// Lombok annotations to reduce boilerplate code
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@AllArgsConstructor   // Generates an all-arguments constructor
@NoArgsConstructor    // Generates a no-argument constructor
@ToString             // Generates a toString() method
public class FundingRowsByID {

    // Fields representing funding data
    private Long id; // Unique identifier for the funding record

    private String funding; // General description or type of funding

    private String fundingOther; // Additional details about the funding

    private String fundingNIHR; // Specific details about NIHR (National Institute for Health Research) funding

    private String fundingNIHROther; // Additional details about NIHR funding

    private String fundingUKRIMRC; // Details about UKRI-MRC (UK Research and Innovation - Medical Research Council) funding

    private String fundingUKRIMRCOther; // Additional details about UKRI-MRC funding

    private String fundingWellcomeTrust; // Details about funding from the Wellcome Trust

    private String fundingWellcomeTrustOther; // Additional details about Wellcome Trust funding

    private String scheme; // Overview of the funding scheme

    private String schemeOther; // Additional details about the funding scheme

    private int value; // Total value or amount of funding

    private Date fundingStartDate; // Start date of the funding period

    private Date fundingEndDate; // End date of the funding period

    private String aims; // Description of the aims and objectives of the funding

    private String grantNumber; // Grant number associated with the funding

    private String worktribeNumber; // Worktribe number associated with the funding
}
