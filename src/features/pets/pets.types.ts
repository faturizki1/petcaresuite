export interface SpeciesOption {
  id: string;
  name: string;
}

export interface BreedOption {
  id: string;
  name: string;
  speciesId: string;
}

export interface Pet {
  id: string;
  name: string;
  customerId: string;
  customerName?: string | null;
  photoUrl?: string | null;
  speciesId: string;
  species?: string | null;
  breedId: string;
  breed?: string | null;
  gender: 'male' | 'female' | 'unknown';
  birthDate?: string | null;
  weight?: number | null;
  color?: string | null;
  isSterilized: boolean;
  microchipNumber?: string | null;
  qrCode?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PetFormData {
  name: string;
  customerId: string;
  speciesId: string;
  breedId: string;
  gender: 'male' | 'female' | 'unknown';
  birthDate?: string;
  weight?: number;
  color?: string;
  isSterilized?: boolean;
  microchipNumber?: string;
  photoUrl?: string | null;
  isActive?: boolean;
}

export interface WeightRecord { id: string; petId: string; weight: number; recordedAt: string }
