export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdDate: Date;
  modifiedDate: Date;
  enabled: boolean;
  delete: boolean;
  role_id: number;
  role: string;
}
export interface UserPassword {
  password: string;
}
/**SybeUser Database table interface */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  createdDate: Date;
  modifiedDate: Date;
  email: string;
  enabled: boolean;
  delete: boolean;
}
