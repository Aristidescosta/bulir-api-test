export interface IUser {
  id: string;
  name: string;
  email: string;
  nif: string;
  password_hash: string;
  phone?:  string | null | undefined;
  type: EUserType;
  status: EUserStatus;
  created_at: Date;
  updated_at: Date;
  balance: number
}

export enum EUserType {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
}

export enum EUserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}