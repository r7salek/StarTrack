export interface initialQuestionsAdd {
  lastNamePI:string;
  firstNamePI:string;
  email:string;
  department:string;
  modality:string;
  areaOfExpertise:string;
  innovation:string;
  fundingGrants:string;
  scheme:string;
  ttoContractStatus:string;
}
export interface initialQuestions {
  id: number;
  lastNamePI:string;
  firstNamePI:string;
  email:string;
  department:string;
  modality:string;
  areaOfExpertise:string;
  innovation:string;
  fundingGrants:string;
  scheme:string;
  ttoContractStatus:string;
  createdDate: Date;
  expanded?: boolean;
}
