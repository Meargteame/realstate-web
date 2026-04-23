export interface Agent {
  id: string;
  name: string;
  license: string;
  brokerage: string;
  languages: string[];
  phone: string;
  email: string;
  imageUrl?: string;
  isLuxury?: boolean;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl?: string;
  isLuxury?: boolean;
  propertyType: string;
}
