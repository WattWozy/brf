// Domain entities — the language of the business.
// Deliberately free of any framework or persistence concern.

export type Role = "STYRELSE" | "BOENDE";

export type IssueStatus = "INKOMMEN" | "TRIAGE" | "AVFARDAD" | "ATGARDAD";

export type JobStatus =
  | "UTKAST"
  | "PUBLICERAT"
  | "TILLDELAT"
  | "PAGAR"
  | "KLART";

export type JobCategory =
  | "HANTVERK"
  | "RORMOKARARBETE"
  | "RENOVERING"
  | "EL"
  | "TRADGARD"
  | "BASTU"
  | "NATVERK"
  | "ANNAT";

export type JobPriority = "LAG" | "MEDEL" | "HOG";

export interface Brf {
  id: string;
  name: string;
  orgNumber: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  apartment: string | null;
  brfId: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string | null;
  imageUrl: string | null;
  status: IssueStatus;
  brfId: string;
  authorId: string;
  createdAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  category: JobCategory;
  priority: JobPriority;
  publicToken: string;
  deadline: Date | null;
  brfId: string;
  issueId: string | null;
  awardedBidId: string | null;
  createdAt: Date;
}

export interface Bid {
  id: string;
  jobId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  priceSek: number;
  estimatedDays: number | null;
  message: string | null;
  businessId: string | null;
  createdAt: Date;
}

export interface Resource {
  id: string;
  name: string;
  brfId: string;
}

export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  brfId: string;
  authorId: string;
  createdAt: Date;
  endDate: Date | null;
}

export interface BrfDocument {
  id: string;
  title: string;
  url: string;
  brfId: string;
  createdAt: Date;
}

/** The authenticated principal carried through use-cases. */
export interface Principal {
  userId: string;
  brfId: string;
  role: Role;
}

export interface Business {
  id: string;
  companyName: string;
  orgNumber: string | null;
  contactName: string;
  email: string;
  phone: string | null;
  description: string | null;
  createdAt: Date;
}

export interface BusinessPrincipal {
  businessId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
}
