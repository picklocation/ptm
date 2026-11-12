export type Kind = "holiday" | "road-trip" | "resort" | "destination";
export type Content = {
  id: string;
  kind: Kind;
  title: string;
  slug: string;
  location: string;
  region: string;
  country?: string;
  stayDestination?: boolean;
  stayDestinationSlug?: string;
  propertyVerified?: boolean;
  stayTags?: (typeof import("./stays").stayTags)[number][];
  state?: string;
  locations?: string[];
  packageType?: (typeof import("./classification").packageTypes)[number];
  collections?: import("./classification").Collection[];
  summary: string;
  description: string;
  image: string;
  gallery: string[];
  galleryAlt?: Record<string, string>;
  accommodation?: string;
  imageAlt: string;
  days: number;
  nights: number;
  themes: string[];
  featured: boolean;
  order: number;
  status: "draft" | "published" | "archived";
  demo: boolean;
  itinerary: { title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  amenities: string[];
  rooms: string[];
  mealPlans: string[];
  vehicles: { name: string; passengers: number; luggage: string }[];
  price?: number;
  // Price before a discount. Shown struck through beside `price`.
  originalPrice?: number;
  currency: string;
  priceBasis: string;
  priceConditions: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};
export type Enquiry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  destination: string;
  kind: string;
  startDate: string;
  endDate: string;
  flexible: boolean;
  adults: number;
  children: number;
  childAges: string;
  rooms: number;
  departure: string;
  budget: string;
  currency: string;
  budgetBasis: string;
  preferences: string;
  vehicle: string;
  mealPlan: string;
  contactMethod: string;
  itemId: string;
  itemTitle: string;
  method: "submit" | "whatsapp";
  status: string;
  assignedTo: string;
  followUp: string;
  notes: { text: string; author: string; at: string }[];
  history: { status: string; at: string; author: string }[];
  excelStatus: string;
  demo: boolean;
};
export type Staff = {
  id: string;
  email: string;
  role: "owner" | "editor" | "enquiries";
  passwordHash?: string;
  active: boolean;
};
export type Settings = {
  whatsapp: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
  about: string;
  privacy: string;
  terms: string;
  cancellation: string;
  faqs: { question: string; answer: string }[];
};
export const statuses = [
  "new",
  "contacted",
  "quote sent",
  "confirmed",
  "closed",
];
export const paths: Record<Kind, string> = {
  holiday: "holidays",
  "road-trip": "europe-road-trips",
  resort: "resorts-and-villas",
  destination: "destinations",
};
export const defaultSettings: Settings = {
  whatsapp: "917902220044",
  email: "",
  phone: "",
  address: "",
  instagram: "",
  facebook: "",
  about: "",
  privacy: "",
  terms: "",
  cancellation: "",
  faqs: [
    {
      question: "Can you customise a holiday for us?",
      answer:
        "Yes. Tell us where you would like to go, who is travelling and what matters to you. Your enquiry starts a conversation about a personalised itinerary.",
    },
    {
      question: "Can I enquire before choosing my dates?",
      answer:
        "Absolutely. Select flexible dates and share your preferred month or season in the notes.",
    },
    {
      question: "Does submitting an enquiry confirm a booking?",
      answer:
        "No. Your enquiry is a request for a personalised quote. Arrangements and availability are confirmed separately with the team.",
    },
    {
      question: "What is included in a holiday?",
      answer:
        "Inclusions vary by trip. Your final quote will explain accommodation, transport, activities and any exclusions.",
    },
  ],
};
