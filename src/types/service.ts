export interface IService {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  dataCreated: Date;
  dataUpdated: Date;
}