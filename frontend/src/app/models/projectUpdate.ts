export interface projectUpdateAdd {
  projectName: string;
  date: Date;
  connections: string;
  connectionsType: string;
  application: string;
  funding: string;
  funding1: string;
  scheme: string;
  scheme1: string;
  collaborationPartners: string;
  collaborationPartnersDetails: string;
  tto: string;
  ttoDetails: string;
  scientificUpdate: string;
  grantOutcome: string;
  grantProjectName: string;
  grantProjectDuration: string;
  grantAwardValue: string;
  grantFunder: string;
  grantFunder1: string;
  grantScheme: string;
  grantScheme1: string;
  grantProjectMilestones: string;
  grantCollaborationPartners: string;
  grantCollaborationPartnersDetails: string;
  grantAdditionalFunding: string;
  grantAdditionalFundingDetails: string;
  grantMainTypeContributions: string;
  grantMainTypeContributions1: string;
  grantKnowledgeImpact: string;
  grantKnowledgeImpactDetails: string;
  createdEmail: string;
  modifyEmail: string;
}
export interface projectUpdate {
  id: number;
  projectName: string;
  date: Date;
  connections: string;
  connectionsType: string;
  application: string;
  funding: string;
  funding1: string;
  scheme: string;
  scheme1: string;
  collaborationPartners: string;
  collaborationPartnersDetails: string;
  tto: string;
  ttoDetails: string;
  scientificUpdate: string;
  grantOutcome: string;
  grantProjectName: string;
  grantProjectDuration: string;
  grantAwardValue: string;
  grantFunder: string;
  grantFunder1: string;
  grantScheme: string;
  grantScheme1: string;
  grantProjectMilestones: string;
  grantCollaborationPartners: string;
  grantCollaborationPartnersDetails: string;
  grantAdditionalFunding: string;
  grantAdditionalFundingDetails: string;
  grantMainTypeContributions: string;
  grantMainTypeContributions1: string;
  grantKnowledgeImpact: string;
  grantKnowledgeImpactDetails: string;
  createdEmail: string;
  modifyEmail: string;
  createdDate: Date;
  expanded?: boolean;
}
export interface newProject {
  //Teams
  projectName: string;
  lastNamePI: string;
  firstNamePI: string;
  emailPI: string;
  departmentPI: string;
  crsidPI: string;
  otherInforPI: string;
  groupMemberRows: GroupMemberRowsResponse[];
  ttoContractName: string;
  ttoContractEmail: string;
  ttoContractOtherInfo: string;
  subContractorsRows: SubContractorsRowsResponse[];
  //Scope
  modality: string;
  modalityOther: string;
  areaOfExpertise: string;
  areaOfExpertiseOther: string;
  readiness: string;
  projectBackground: string;
  briefDescription: string;
  outputRows: OutputRowsResponse[];
  collaborationRows: CollaborationRowsResponse[];
  externalAdvisorsRows: ExternalAdvisorRowsResponse[];
  ppiRows: PPIRowsResponse[];
  fundingRows: FundingRowsResponse[];
  fundingOverviewRows: FundOverviewRowsResponse[];
  otrRows: OTRRowsResponse[];
}
export interface OTRRowsResponse {
  id: number;
  otrTeamMember: string;
  otrRole: string;
  otrFunding: string;
  otrDate: Date;
  otrOtherInfo: string;
}
export interface PPIRowsResponse {
  id: number;
  ppiMeeting: Date;
  ppiContact: string;
  ppiGroup: string;
  ppiOutcome: string;
}
export interface SubContractorsRowsResponse {
  id: number;
  subContractorsName: string;
  subContractorsEmail: string;
  subContractorsExpertise: string;
  subContractorsOrganisation: string;
  subContractorsOtherInfo: string;
}
export interface GroupMemberRowsResponse {
  id: number;
  lastNamePostDoc: string;
  firstNamePostDoc: string;
  emailPostDoc: string;
  departmentPostDoc: string;
  positionPostDoc: string;
  crsidPostDoc: string;
  otherInforPostDoc: string;
}
export interface OutputRowsResponse {
  id: number;
  output: string;
  confirmation: string;
  outputQuantity: number;
  output_description: string;
}
export interface CollaborationRowsResponse {
  id: number;
  collaboration: string;
  collaborationName: string;
  collaborationEmail: string;
  collaborationLocation: string;
  collaborationOtherInfo: string;
}
export interface ExternalAdvisorRowsResponse {
  id: number;
  externalAdvisorsMeeting: Date;
  externalAdvisorsOrganisation: string;
  externalAdvisorsName: string;
  externalAdvisorsEmail: string;
  externalAdvisorsOutcome: string;
  externalAdvisorsExpertise: string;
}
//FundingRowsResponse
export interface FundOverviewRowsResponse {
  id: number;
  fundingOverview: string | string[];
  fundingOverviewOther: string;
  fundingOverviewNIHR: string;
  fundingOverviewNIHROther: string;
  fundingOverviewUKRIMRC: string;
  fundingOverviewUKRIMRCOther: string;
  fundingOverviewWellcomeTrust: string;
  fundingOverviewWellcomeTrustOther: string;
  schemeOverview: string;
  schemeOverviewOther: string;
  valueOverview: number;
  fundingOverviewStartDate: Date;
  fundingEfundingOverviewEndDatendDate: Date;
  aimsOverview: string;
  grantNumberOverview: string;
  worktribeNumberOverview: string;
}
export interface FundingRowsResponse {
  id: number;
  funding: string | string[];
  fundingOther: string;
  fundingNIHR: string;
  fundingNIHROther: string;
  fundingUKRIMRC: string;
  fundingUKRIMRCOther: string;
  fundingWellcomeTrust: string;
  fundingWellcomeTrustOther: string;
  scheme: string;
  schemeOther: string;
  value: number;
  fundingStartDate: Date;
  fundingEndDate: Date;
  aims: string;
  grantNumber: string;
  worktribeNumber: string;
}
export interface newProjectResponse {
  //Teams
  id: number;
  projectName: string;
  lastNamePI: string;
  firstNamePI: string;
  emailPI: string;
  departmentPI: string;
  crsidPI: string;
  otherInforPI: string;

  fundingOverview: string | string[];
  schemeOverview: string;
  valueOverview: number;
  fundingOverviewStartDate: Date;
  fundingEfundingOverviewEndDatendDate: Date;
  grantNumberOverview: string;
  worktribeNumberOverview: string;

  ttoContractName: string;
  ttoContractEmail: string;
  ttoContractOtherInfo: string;
  //Funding
  funding: string | string[];
  fundingOther: string;
  duration: string;
  grantNumber: string;
  worktribeNumber: string;
  value: string;
  fundingNIHR: string;
  fundingNIHROther: string;
  fundingUKRIMRC: string;
  fundingUKRIMRCOther: string;
  fundingWellcomeTrust: string;
  fundingWellcomeTrustOther: string;
  //Scope
  modality: string | string[];
  modalityOther: string;
  areaOfExpertise: string | string[];
  areaOfExpertiseOther: string;
  readiness: string;
  projectBackground: string;
  briefDescription: string;
  createdEmail: string;
  createdDate: Date;
  modifyEmail: string;
  applyValue: string;
}
