export enum EServiceCategory {
  BEAUTY = 'BEAUTY',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  TECHNOLOGY = 'TECHNOLOGY',
  CONSULTING = 'CONSULTING',
  MAINTENANCE = 'MAINTENANCE',
  EVENTS = 'EVENTS',
  OTHER = 'OTHER',
}

export enum EServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface IService {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  category: EServiceCategory;
  duration: number;
  price: number;
  status: EServiceStatus;
  created_at: Date;
  updated_at: Date;
}

export interface IServiceWithProvider extends IService {
  provider_name: string;
  provider_email: string;
  provider_phone: string | null;
}

export interface ICreateServiceDTO {
  provider_id: string;
  name: string;
  description: string;
  category: EServiceCategory;
  duration: number;
  price: number;
}

export interface IUpdateServiceDTO {
  name?: string;
  description?: string;
  category?: EServiceCategory;
  duration_minutes?: number;
  price?: number;
  status?: EServiceStatus;
}

export interface IServiceFilters {
  provider_id?: string;
  category?: EServiceCategory;
  status?: EServiceStatus;
  min_price?: number;
  max_price?: number;
  search?: string; // Busca por nome ou descrição
  limit?: number;
  offset?: number;
}