/**
 * FundingOverviewRowsResponse DTO (Data Transfer Object) class
 * Used for transferring funding overview data as a response structure.
 * Represents detailed funding overview information for retrieval purposes.
 */

package com.star_track.star_track.starTrack.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.Date;
import java.util.List;

// Lombok annotations to reduce boilerplate code
@Data                 // Combines getter, setter, equals, hashCode, and toString methods
@AllArgsConstructor   // Generates an all-arguments constructor
@NoArgsConstructor    // Generates a no-argument constructor
@ToString             // Generates a toString() method
public class FundingOverviewRowsResponse {

    // Fields representing funding overview data
    private Long id; // Unique identifier for the funding overview record

    private List<String> fundingOverview; // List of general descriptions or types of funding

    private String fundingOverviewOther; // Additional details about the funding

    private String fundingOverviewNIHR; // Specific details about NIHR (National Institute for Health Research) funding

    private String fundingOverviewNIHROther; // Additional details about NIHR funding

    private String fundingOverviewUKRIMRC; // Details about UKRI-MRC (UK Research and Innovation - Medical Research Council) funding

    private String fundingOverviewUKRIMRCOther; // Additional details about UKRI-MRC funding

    private String fundingOverviewWellcomeTrust; // Details about funding from the Wellcome Trust

    private String fundingOverviewWellcomeTrustOther; // Additional details about Wellcome Trust funding

    private String schemeOverview; // Overview of the funding scheme

    private String schemeOverviewOther; // Additional details about the funding scheme

    private int valueOverview; // Total value or amount of funding

    private Date fundingOverviewStartDate; // Start date of the funding period

    private Date fundingOverviewEndDate; // End date of the funding period

    private String aimsOverview; // Description of the aims and objectives of the funding

    private String grantNumberOverview; // Grant number associated with the funding

    private String worktribeNumberOverview; // Worktribe number associated with the funding
}
