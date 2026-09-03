/**
 * FundingRowsResponse DTO (Data Transfer Object) class
 * Used for inserting and transferring funding data as part of a response structure.
 * Represents detailed funding information in a structured format.
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
public class FundingRowsResponse {

    // Fields representing funding data

    /**
     * Unique identifier for the funding record.
     * Represents the primary key used to identify a specific funding entry.
     */
    private Long id;

    /**
     * List of general descriptions or types of funding.
     * Allows multiple funding descriptions to be stored and transferred.
     */
    private List<String> funding;

    /**
     * Additional details or supplementary information about the funding.
     * Used to provide context or clarify funding specifics.
     */
    private String fundingOther;

    /**
     * Specific details about NIHR (National Institute for Health Research) funding.
     * Captures the nature or type of NIHR-related funding provided.
     */
    private String fundingNIHR;

    /**
     * Supplementary details about NIHR funding.
     * Used to include extra context or nuances related to NIHR grants.
     */
    private String fundingNIHROther;

    /**
     * Details about UKRI-MRC (UK Research and Innovation - Medical Research Council) funding.
     * Captures the type or scope of UKRI-MRC funding provided.
     */
    private String fundingUKRIMRC;

    /**
     * Additional context or information related to UKRI-MRC funding.
     * Used to provide further insights into UKRI-MRC grants or allocations.
     */
    private String fundingUKRIMRCOther;

    /**
     * Information about Wellcome Trust funding.
     * Captures the details of grants or contributions provided by the Wellcome Trust.
     */
    private String fundingWellcomeTrust;

    /**
     * Supplementary details about Wellcome Trust funding.
     * Provides additional context or specifics about the funding.
     */
    private String fundingWellcomeTrustOther;

    /**
     * Overview of the funding scheme associated with this entry.
     * Captures the structure or type of funding initiative.
     */
    private String scheme;

    /**
     * Additional details about the funding scheme.
     * Provides further information about the scheme's scope or nature.
     */
    private String schemeOther;

    /**
     * Total monetary value of the funding.
     * Represents the overall amount allocated for the specified funding.
     */
    private int value;

    /**
     * Start date of the funding period.
     * Indicates when the funding becomes active or applicable.
     */
    private Date fundingStartDate;

    /**
     * End date of the funding period.
     * Marks the conclusion of the funding's active period.
     */
    private Date fundingEndDate;

    /**
     * Description of the aims or objectives of the funding.
     * Captures the goals or intended outcomes supported by the funding.
     */
    private String aims;

    /**
     * Grant number associated with the funding.
     * Serves as a unique identifier for the funding grant.
     */
    private String grantNumber;

    /**
     * Worktribe number associated with the funding.
     * Represents the internal tracking number used in Worktribe systems.
     */
    private String worktribeNumber;
}
