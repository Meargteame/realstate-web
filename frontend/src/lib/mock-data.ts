export interface Property {
  id: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  imageUrl: string;
  status: 'Active' | 'Pending' | 'Sold';
  propertyType: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family';
  agentId: string;
}

export const mockProperties: Property[] = [
  {
    id: 'p1',
    price: 850000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    address: '1234 Maple Leaf Ln',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a1'
  },
  {
    id: 'p2',
    price: 425000,
    beds: 2,
    baths: 2,
    sqft: 1200,
    address: '500 Downtown Blvd #4B',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    imageUrl: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Condo',
    agentId: 'a2'
  },
  {
    id: 'p3',
    price: 1200000,
    beds: 5,
    baths: 4.5,
    sqft: 4500,
    address: '888 Luxury View Escarpment',
    city: 'West Lake Hills',
    state: 'TX',
    zip: '78746',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    status: 'Pending',
    propertyType: 'Single Family',
    agentId: 'a1'
  },
  {
    id: 'p4',
    price: 650000,
    beds: 3,
    baths: 2.5,
    sqft: 1900,
    address: '101 Suburban Way',
    city: 'Round Rock',
    state: 'TX',
    zip: '78664',
    imageUrl: 'https://images.unsplash.com/photo-1600607687931-cebf0746e424?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a3'
  },
  {
    id: 'p5',
    price: 385000,
    beds: 3,
    baths: 2,
    sqft: 1550,
    address: '422 Cedar Park Dr',
    city: 'Cedar Park',
    state: 'TX',
    zip: '78613',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Townhouse',
    agentId: 'a2'
  },
  {
    id: 'p6',
    price: 2100000,
    beds: 6,
    baths: 6,
    sqft: 6200,
    address: '10 Private Island Estate',
    city: 'Austin',
    state: 'TX',
    zip: '78732',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a1'
  }
];

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  imageUrl: string;
  brokerage: string;
  rating: number;
  reviews: number;
  license: string;
  languages: string[];
  isLuxury: boolean;
}

export const mockAgents: Agent[] = [
  {
    id: 'a1',
    name: 'Sarah Jenkins',
    phone: '(512) 555-0198',
    email: 'sarah.j@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Forney',
    rating: 4.9,
    reviews: 124,
    license: 'DRE# 01234567',
    languages: ['English'],
    isLuxury: true
  },
  {
    id: 'a2',
    name: 'Michael Chen',
    phone: '(512) 555-0234',
    email: 'm.chen@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Downtown',
    rating: 4.8,
    reviews: 89,
    license: 'DRE# 98765432',
    languages: ['English', 'Mandarin'],
    isLuxury: false
  },
  {
    id: 'a3',
    name: 'Jessica Gomez',
    phone: '(512) 555-0887',
    email: 'jgomez@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Luxury',
    rating: 5.0,
    reviews: 210,
    license: 'DRE# 45678901',
    languages: ['English', 'Spanish'],
    isLuxury: true
  },
  {
    id: 'a4',
    name: 'James O\'Neal',
    phone: '(309) 275-9292',
    email: 'jim.oneal@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Commercial',
    rating: 4.7,
    reviews: 56,
    license: 'DRE# 65011652',
    languages: ['English'],
    isLuxury: false
  },
  {
    id: 'a5',
    name: 'Renee M. Pina',
    phone: '(949) 698-2003',
    email: 'reneempina@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Pacific Estates',
    rating: 4.9,
    reviews: 140,
    license: 'DRE# 01218728',
    languages: ['English', 'Spanish'],
    isLuxury: true
  }
];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId?: string;
  message: string;
  status: 'New' | 'Contacted' | 'Showing' | 'Closed';
  date: string;
  agentId: string;
}

export const mockLeads: Lead[] = [
  {
    id: 'L1',
    name: 'Michael Scott',
    email: 'michael.s@example.com',
    phone: '(555) 123-4567',
    propertyId: 'p1',
    message: 'I would love to schedule a tour for this home this weekend. What is your availability?',
    status: 'New',
    date: '2026-04-10T09:30:00Z',
    agentId: 'a1'
  },
  {
    id: 'L2',
    name: 'Pam Beesly',
    email: 'pam.b@example.com',
    phone: '(555) 987-6543',
    propertyId: 'p3',
    message: 'We are pre-approved and very interested in this property. Are there any offers currently on the table?',
    status: 'Contacted',
    date: '2026-04-09T14:15:00Z',
    agentId: 'a1'
  },
  {
    id: 'L3',
    name: 'Jim Halpert',
    email: 'jim.h@example.com',
    phone: '(555) 555-5555',
    message: 'Looking to buy a 3-bedroom down in South Austin before the end of the year. Can we set up a call?',
    status: 'New',
    date: '2026-04-08T11:00:00Z',
    agentId: 'a1'
  },
  {
    id: 'L4',
    name: 'Dwight Schrute',
    email: 'dwight@example.com',
    phone: '(555) 111-2222',
    propertyId: 'p6',
    message: 'I am looking for a private estate. I saw your listing for the island property and I want an immediate showing.',
    status: 'Showing',
    date: '2026-04-05T16:45:00Z',
    agentId: 'a1'
  }
];
