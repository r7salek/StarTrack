package com.star_track.star_track.starTrack.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

/** Full saved snapshot. Numeric child APIs continue to address versionId. */
@Getter @Setter
public class ProjectVersionResponse extends ProjectDataResponse {
    private List<GroupMemberRowsResponse> groupMemberRows;
    private List<OutputRowsResponse> outputRows;
    private List<CollaborationRowsResponse> collaborationRows;
    private List<ExternalAdvisorsRowsResponse> externalAdvisorsRows;
    private List<SubContractorsRowsResponse> subContractorsRows;
    private List<PpiRowsResponse> ppiRows;
    private List<otrRowsResponse> otrRows;
    private List<FundingRowsByID> fundingRows;
    private List<FundingOverviewRowsByID> fundingOverviewRows;
}
