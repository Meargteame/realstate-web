const { PrismaClient } = require('@prisma/client');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// Generate proper bcrypt hash for password123
const passwordHash = bcrypt.hashSync('password123', 10);

const agents = [
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
    isLuxury: true,
    bio: 'Luxury home specialist with 15+ years experience in Austin real estate.',
    location: 'Austin Southwest',
    specialties: 'Luxury Homes, New Construction, Investment Properties'
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
    isLuxury: false,
    bio: 'Downtown condo expert helping clients find their perfect urban home.',
    location: 'Downtown Austin',
    specialties: 'Condos, First-Time Buyers, Urban Living'
  },
  {
    id: 'a3',
    name: 'Jennifer Martinez',
    phone: '(512) 555-0345',
    email: 'j.martinez@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Luxury',
    rating: 5.0,
    reviews: 156,
    license: 'DRE# 11223344',
    languages: ['English', 'Spanish'],
    isLuxury: true,
    bio: 'Award-winning luxury agent specializing in high-end properties.',
    location: 'Westlake & Tarrytown',
    specialties: 'Luxury Estates, Waterfront, Golf Course Properties'
  },
  {
    id: 'a4',
    name: 'David Thompson',
    phone: '(512) 555-0456',
    email: 'd.thompson@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA North',
    rating: 4.7,
    reviews: 78,
    license: 'DRE# 55667788',
    languages: ['English'],
    isLuxury: false,
    bio: 'Family-focused agent helping families find their dream homes.',
    location: 'North Austin',
    specialties: 'Family Homes, Schools, Suburban Living'
  },
  {
    id: 'a5',
    name: 'Emily Rodriguez',
    phone: '(512) 555-0567',
    email: 'e.rodriguez@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA South',
    rating: 4.9,
    reviews: 203,
    license: 'DRE# 99887766',
    languages: ['English', 'Spanish'],
    isLuxury: false,
    bio: 'Bilingual agent serving South Austin with dedication and expertise.',
    location: 'South Austin',
    specialties: 'First-Time Buyers, Relocation, Bilingual Services'
  },
  {
    id: 'a6',
    name: 'James Wilson',
    phone: '(512) 555-0678',
    email: 'j.wilson@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Westlake',
    rating: 4.8,
    reviews: 145,
    license: 'DRE# 22334455',
    languages: ['English'],
    isLuxury: true,
    bio: 'Luxury market expert with deep knowledge of Westlake properties.',
    location: 'Westlake',
    specialties: 'Luxury Homes, Lake Properties, Custom Builds'
  },
  {
    id: 'a7',
    name: 'Lisa Anderson',
    phone: '(512) 555-0789',
    email: 'l.anderson@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA East',
    rating: 4.6,
    reviews: 67,
    license: 'DRE# 66778899',
    languages: ['English'],
    isLuxury: false,
    bio: 'East Austin specialist helping clients discover this vibrant neighborhood.',
    location: 'East Austin',
    specialties: 'Urban Living, Investment Properties, Renovations'
  },
  {
    id: 'a8',
    name: 'Robert Kim',
    phone: '(512) 555-0890',
    email: 'r.kim@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Downtown',
    rating: 4.9,
    reviews: 112,
    license: 'DRE# 33445566',
    languages: ['English', 'Korean'],
    isLuxury: false,
    bio: 'Tech-savvy agent specializing in downtown condos and lofts.',
    location: 'Downtown Austin',
    specialties: 'Condos, Tech Professionals, Urban Lifestyle'
  },
  {
    id: 'a9',
    name: 'Amanda Foster',
    phone: '(512) 555-0901',
    email: 'a.foster@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Estates',
    rating: 5.0,
    reviews: 189,
    license: 'DRE# 77889900',
    languages: ['English', 'French'],
    isLuxury: true,
    bio: 'International luxury agent with expertise in high-end estates.',
    location: 'West Austin',
    specialties: 'Luxury Estates, International Clients, French Speakers'
  },
  {
    id: 'a10',
    name: 'Christopher Lee',
    phone: '(512) 555-1012',
    email: 'c.lee@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Round Rock',
    rating: 4.7,
    reviews: 94,
    license: 'DRE# 44556677',
    languages: ['English'],
    isLuxury: false,
    bio: 'Round Rock expert helping families find homes in great school districts.',
    location: 'Round Rock',
    specialties: 'Family Homes, Schools, Suburban Communities'
  },
  {
    id: 'a11',
    name: 'Maria Garcia',
    phone: '(512) 555-1123',
    email: 'm.garcia@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Cedar Park',
    rating: 4.8,
    reviews: 128,
    license: 'DRE# 88990011',
    languages: ['English', 'Spanish'],
    isLuxury: false,
    bio: 'Cedar Park specialist with a passion for helping families settle in.',
    location: 'Cedar Park',
    specialties: 'Family Homes, New Construction, Bilingual Services'
  },
  {
    id: 'a12',
    name: 'Daniel Brown',
    phone: '(512) 555-1234',
    email: 'd.brown@torra.com',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    brokerage: 'TORRA Pflugerville',
    rating: 4.6,
    reviews: 73,
    license: 'DRE# 11223355',
    languages: ['English'],
    isLuxury: false,
    bio: 'Pflugerville expert helping clients find affordable family homes.',
    location: 'Pflugerville',
    specialties: 'Affordable Housing, First-Time Buyers, Veterans'
  }
];

const properties = [
  // Austin Properties
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
    price: 1250000,
    beds: 5,
    baths: 4.5,
    sqft: 4200,
    address: '789 Westlake Hills Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78746',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a3'
  },
  {
    id: 'p4',
    price: 675000,
    beds: 3,
    baths: 2.5,
    sqft: 2100,
    address: '456 Oak Valley Rd',
    city: 'Austin',
    state: 'TX',
    zip: '78731',
    imageUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a4'
  },
  {
    id: 'p5',
    price: 525000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    address: '321 South Congress Ave',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Townhouse',
    agentId: 'a5'
  },
  {
    id: 'p6',
    price: 2100000,
    beds: 6,
    baths: 5.5,
    sqft: 5800,
    address: '1000 Barton Creek Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78735',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a6'
  },
  {
    id: 'p7',
    price: 385000,
    beds: 2,
    baths: 2,
    sqft: 1100,
    address: '234 East 6th St #12C',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Condo',
    agentId: 'a7'
  },
  {
    id: 'p8',
    price: 795000,
    beds: 4,
    baths: 3,
    sqft: 2650,
    address: '567 Mueller Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78723',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    status: 'Pending',
    propertyType: 'Single Family',
    agentId: 'a8'
  },
  {
    id: 'p9',
    price: 1850000,
    beds: 5,
    baths: 5,
    sqft: 5200,
    address: '890 Tarrytown Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78703',
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a9'
  },
  {
    id: 'p10',
    price: 445000,
    beds: 3,
    baths: 2,
    sqft: 1650,
    address: '123 Riverside Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78741',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a10'
  },
  // Round Rock Properties
  {
    id: 'p11',
    price: 425000,
    beds: 3,
    baths: 2.5,
    sqft: 2000,
    address: '456 Round Rock Ave',
    city: 'Round Rock',
    state: 'TX',
    zip: '78664',
    imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a10'
  },
  {
    id: 'p12',
    price: 385000,
    beds: 4,
    baths: 2,
    sqft: 2200,
    address: '789 Brushy Creek Rd',
    city: 'Round Rock',
    state: 'TX',
    zip: '78681',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a10'
  },
  {
    id: 'p13',
    price: 495000,
    beds: 4,
    baths: 3,
    sqft: 2500,
    address: '321 Teravista Blvd',
    city: 'Round Rock',
    state: 'TX',
    zip: '78665',
    imageUrl: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a10'
  },
  // Cedar Park Properties
  {
    id: 'p14',
    price: 465000,
    beds: 3,
    baths: 2.5,
    sqft: 2100,
    address: '234 Cedar Park Dr',
    city: 'Cedar Park',
    state: 'TX',
    zip: '78613',
    imageUrl: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a11'
  },
  {
    id: 'p15',
    price: 525000,
    beds: 4,
    baths: 3,
    sqft: 2700,
    address: '567 Whitestone Blvd',
    city: 'Cedar Park',
    state: 'TX',
    zip: '78613',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a11'
  },
  {
    id: 'p16',
    price: 395000,
    beds: 3,
    baths: 2,
    sqft: 1900,
    address: '890 Lakeline Blvd',
    city: 'Cedar Park',
    state: 'TX',
    zip: '78613',
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a11'
  },
  // Pflugerville Properties
  {
    id: 'p17',
    price: 375000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    address: '123 Pflugerville Pkwy',
    city: 'Pflugerville',
    state: 'TX',
    zip: '78660',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a12'
  },
  {
    id: 'p18',
    price: 425000,
    beds: 4,
    baths: 2.5,
    sqft: 2300,
    address: '456 Blackhawk Dr',
    city: 'Pflugerville',
    state: 'TX',
    zip: '78660',
    imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a12'
  },
  {
    id: 'p19',
    price: 485000,
    beds: 4,
    baths: 3,
    sqft: 2600,
    address: '789 Windermere Dr',
    city: 'Pflugerville',
    state: 'TX',
    zip: '78660',
    imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a12'
  },
  // More Austin Properties
  {
    id: 'p20',
    price: 595000,
    beds: 3,
    baths: 2.5,
    sqft: 2200,
    address: '234 Hyde Park Ave',
    city: 'Austin',
    state: 'TX',
    zip: '78751',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a1'
  },
  {
    id: 'p21',
    price: 725000,
    beds: 4,
    baths: 3,
    sqft: 2900,
    address: '567 Allandale Rd',
    city: 'Austin',
    state: 'TX',
    zip: '78756',
    imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a2'
  },
  {
    id: 'p22',
    price: 1450000,
    beds: 5,
    baths: 4.5,
    sqft: 4800,
    address: '890 Rob Roy Rd',
    city: 'Austin',
    state: 'TX',
    zip: '78746',
    imageUrl: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a3'
  },
  {
    id: 'p23',
    price: 355000,
    beds: 2,
    baths: 2,
    sqft: 1050,
    address: '123 Rainey St #8A',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Condo',
    agentId: 'a4'
  },
  {
    id: 'p24',
    price: 625000,
    beds: 3,
    baths: 2.5,
    sqft: 2400,
    address: '456 Bouldin Ave',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    imageUrl: 'https://images.unsplash.com/photo-1600566752229-250ed79470e6?auto=format&fit=crop&w=800&q=80',
    status: 'Pending',
    propertyType: 'Single Family',
    agentId: 'a5'
  },
  {
    id: 'p25',
    price: 2750000,
    beds: 6,
    baths: 6.5,
    sqft: 6500,
    address: '789 Scenic Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78746',
    imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a6'
  },
  {
    id: 'p26',
    price: 475000,
    beds: 3,
    baths: 2,
    sqft: 1750,
    address: '321 Manor Rd',
    city: 'Austin',
    state: 'TX',
    zip: '78722',
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a7'
  },
  {
    id: 'p27',
    price: 565000,
    beds: 3,
    baths: 2.5,
    sqft: 2150,
    address: '654 Clarksville Ave',
    city: 'Austin',
    state: 'TX',
    zip: '78703',
    imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Townhouse',
    agentId: 'a8'
  },
  {
    id: 'p28',
    price: 1650000,
    beds: 5,
    baths: 4.5,
    sqft: 5000,
    address: '987 Pemberton Heights Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78703',
    imageUrl: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a9'
  },
  {
    id: 'p29',
    price: 415000,
    beds: 2,
    baths: 2.5,
    sqft: 1600,
    address: '234 East Cesar Chavez St',
    city: 'Austin',
    state: 'TX',
    zip: '78702',
    imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Townhouse',
    agentId: 'a1'
  },
  {
    id: 'p30',
    price: 685000,
    beds: 4,
    baths: 3,
    sqft: 2750,
    address: '567 Travis Heights Blvd',
    city: 'Austin',
    state: 'TX',
    zip: '78704',
    imageUrl: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
    status: 'Active',
    propertyType: 'Single Family',
    agentId: 'a2'
  }
];

const leads = [
  {
    id: 'l1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(512) 555-2001',
    message: 'Interested in viewing this property. Available this weekend?',
    status: 'New',
    agentId: 'a1',
    propertyId: 'p1'
  },
  {
    id: 'l2',
    name: 'Emma Johnson',
    email: 'emma.j@email.com',
    phone: '(512) 555-2002',
    message: 'Looking for a 3-bedroom home in Austin under $600k. Can you help?',
    status: 'Contacted',
    agentId: 'a1',
    propertyId: null
  },
  {
    id: 'l3',
    name: 'Michael Davis',
    email: 'm.davis@email.com',
    phone: '(512) 555-2003',
    message: 'First-time buyer. Need guidance on the home buying process.',
    status: 'Qualified',
    agentId: 'a2',
    propertyId: null
  },
  {
    id: 'l4',
    name: 'Sarah Williams',
    email: 's.williams@email.com',
    phone: '(512) 555-2004',
    message: 'Is this property still available? Would like to schedule a showing.',
    status: 'New',
    agentId: 'a2',
    propertyId: 'p2'
  },
  {
    id: 'l5',
    name: 'David Brown',
    email: 'd.brown@email.com',
    phone: '(512) 555-2005',
    message: 'Interested in luxury properties in Westlake area.',
    status: 'Contacted',
    agentId: 'a3',
    propertyId: 'p3'
  },
  {
    id: 'l6',
    name: 'Jennifer Taylor',
    email: 'j.taylor@email.com',
    phone: '(512) 555-2006',
    message: 'Looking to sell my current home and upgrade. Can we discuss?',
    status: 'Qualified',
    agentId: 'a3',
    propertyId: null
  },
  {
    id: 'l7',
    name: 'Robert Anderson',
    email: 'r.anderson@email.com',
    phone: '(512) 555-2007',
    message: 'Relocating to Austin for work. Need help finding a home near downtown.',
    status: 'New',
    agentId: 'a4',
    propertyId: null
  },
  {
    id: 'l8',
    name: 'Lisa Martinez',
    email: 'l.martinez@email.com',
    phone: '(512) 555-2008',
    message: 'What are the HOA fees for this property?',
    status: 'Contacted',
    agentId: 'a4',
    propertyId: 'p4'
  },
  {
    id: 'l9',
    name: 'James Wilson',
    email: 'j.wilson2@email.com',
    phone: '(512) 555-2009',
    message: 'Interested in investment properties. Do you have any multi-family listings?',
    status: 'New',
    agentId: 'a5',
    propertyId: null
  },
  {
    id: 'l10',
    name: 'Patricia Moore',
    email: 'p.moore@email.com',
    phone: '(512) 555-2010',
    message: 'Love this townhouse! Can we schedule a viewing for tomorrow?',
    status: 'Contacted',
    agentId: 'a5',
    propertyId: 'p5'
  },
  {
    id: 'l11',
    name: 'Christopher Lee',
    email: 'c.lee2@email.com',
    phone: '(512) 555-2011',
    message: 'Looking for a luxury estate with pool and guest house.',
    status: 'Qualified',
    agentId: 'a6',
    propertyId: 'p6'
  },
  {
    id: 'l12',
    name: 'Mary Garcia',
    email: 'm.garcia2@email.com',
    phone: '(512) 555-2012',
    message: 'Is the seller willing to negotiate on price?',
    status: 'New',
    agentId: 'a6',
    propertyId: 'p6'
  },
  {
    id: 'l13',
    name: 'Daniel Rodriguez',
    email: 'd.rodriguez@email.com',
    phone: '(512) 555-2013',
    message: 'Looking for a condo in downtown Austin. Budget around $400k.',
    status: 'Contacted',
    agentId: 'a7',
    propertyId: 'p7'
  },
  {
    id: 'l14',
    name: 'Nancy White',
    email: 'n.white@email.com',
    phone: '(512) 555-2014',
    message: 'Interested in properties near good schools. Have two kids.',
    status: 'New',
    agentId: 'a8',
    propertyId: null
  },
  {
    id: 'l15',
    name: 'Paul Harris',
    email: 'p.harris@email.com',
    phone: '(512) 555-2015',
    message: 'What is the status of this property? Still pending?',
    status: 'Contacted',
    agentId: 'a8',
    propertyId: 'p8'
  },
  {
    id: 'l16',
    name: 'Karen Clark',
    email: 'k.clark@email.com',
    phone: '(512) 555-2016',
    message: 'Looking for a luxury home with modern finishes and smart home features.',
    status: 'Qualified',
    agentId: 'a9',
    propertyId: 'p9'
  },
  {
    id: 'l17',
    name: 'Steven Lewis',
    email: 's.lewis@email.com',
    phone: '(512) 555-2017',
    message: 'Interested in Round Rock area. Good schools and family-friendly.',
    status: 'New',
    agentId: 'a10',
    propertyId: 'p11'
  },
  {
    id: 'l18',
    name: 'Betty Walker',
    email: 'b.walker@email.com',
    phone: '(512) 555-2018',
    message: 'Can you provide more photos of the backyard?',
    status: 'Contacted',
    agentId: 'a10',
    propertyId: 'p12'
  },
  {
    id: 'l19',
    name: 'Edward Hall',
    email: 'e.hall@email.com',
    phone: '(512) 555-2019',
    message: 'Looking for properties in Cedar Park with 3+ bedrooms.',
    status: 'New',
    agentId: 'a11',
    propertyId: null
  },
  {
    id: 'l20',
    name: 'Dorothy Allen',
    email: 'd.allen@email.com',
    phone: '(512) 555-2020',
    message: 'Interested in this property. What is the age of the roof and HVAC?',
    status: 'Contacted',
    agentId: 'a11',
    propertyId: 'p14'
  },
  {
    id: 'l21',
    name: 'Kevin Young',
    email: 'k.young@email.com',
    phone: '(512) 555-2021',
    message: 'First-time buyer looking in Pflugerville area. Budget $400k.',
    status: 'Qualified',
    agentId: 'a12',
    propertyId: null
  },
  {
    id: 'l22',
    name: 'Sandra King',
    email: 's.king@email.com',
    phone: '(512) 555-2022',
    message: 'Love this home! Can we make an offer?',
    status: 'Closed',
    agentId: 'a12',
    propertyId: 'p17'
  },
  {
    id: 'l23',
    name: 'Brian Wright',
    email: 'b.wright@email.com',
    phone: '(512) 555-2023',
    message: 'Looking for investment property with good rental potential.',
    status: 'New',
    agentId: 'a1',
    propertyId: null
  },
  {
    id: 'l24',
    name: 'Ashley Scott',
    email: 'a.scott@email.com',
    phone: '(512) 555-2024',
    message: 'Interested in viewing multiple properties this weekend.',
    status: 'Contacted',
    agentId: 'a2',
    propertyId: null
  },
  {
    id: 'l25',
    name: 'George Green',
    email: 'g.green@email.com',
    phone: '(512) 555-2025',
    message: 'What are the property taxes for this home?',
    status: 'New',
    agentId: 'a3',
    propertyId: 'p22'
  }
];

const users = [
  {
    id: 'u1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@torra.com',
    password: passwordHash,
    role: 'agent',
    agentId: 'a1'
  },
  {
    id: 'u2',
    name: 'Michael Chen',
    email: 'm.chen@torra.com',
    password: passwordHash,
    role: 'agent',
    agentId: 'a2'
  },
  {
    id: 'u3',
    name: 'Jennifer Martinez',
    email: 'j.martinez@torra.com',
    password: passwordHash,
    role: 'agent',
    agentId: 'a3'
  },
  {
    id: 'u4',
    name: 'Test User',
    email: 'test@example.com',
    password: passwordHash,
    role: 'user',
    agentId: null
  },
  {
    id: 'u5',
    name: 'Admin User',
    email: 'admin@torra.com',
    password: passwordHash,
    role: 'admin',
    agentId: null
  }
];

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Seed Agents
  console.log('📍 Seeding agents...');
  for (const a of agents) {
    await prisma.agent.upsert({
      where: { id: a.id },
      update: {},
      create: a,
    });
  }
  console.log(`✅ Seeded ${agents.length} agents`);
  
  // Seed Properties
  console.log('🏠 Seeding properties...');
  for (const p of properties) {
    await prisma.property.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log(`✅ Seeded ${properties.length} properties`);
  
  // Seed Leads
  console.log('📧 Seeding leads...');
  for (const l of leads) {
    await prisma.lead.upsert({
      where: { id: l.id },
      update: {},
      create: l,
    });
  }
  console.log(`✅ Seeded ${leads.length} leads`);
  
  // Seed Users
  console.log('👤 Seeding users...');
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: u,
    });
  }
  console.log(`✅ Seeded ${users.length} users`);
  
  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${agents.length} agents`);
  console.log(`   - ${properties.length} properties`);
  console.log(`   - ${leads.length} leads`);
  console.log(`   - ${users.length} users`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Email: sarah.j@torra.com');
  console.log('   Password: password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
