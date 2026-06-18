// Repository ports — the persistence boundary the domain owns.
// Use-cases depend on these interfaces, never on Prisma.

import type {
  Bid,
  Booking,
  Brf,
  BrfDocument,
  Issue,
  IssueStatus,
  Job,
  JobCategory,
  JobPriority,
  JobStatus,
  Post,
  Resource,
  Role,
  User,
} from "../domain/entities";

export interface NewUser {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  apartment: string | null;
  brfId: string;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  create(data: NewUser): Promise<User>;
  listByBrf(brfId: string): Promise<User[]>;
}

export interface BrfRepository {
  findById(id: string): Promise<Brf | null>;
  create(data: { name: string; orgNumber: string | null }): Promise<Brf>;
}

export interface IssueRepository {
  create(data: {
    title: string;
    description: string;
    location: string | null;
    imageUrl: string | null;
    brfId: string;
    authorId: string;
  }): Promise<Issue>;
  findById(id: string): Promise<Issue | null>;
  listByBrf(brfId: string): Promise<Issue[]>;
  updateStatus(id: string, status: IssueStatus): Promise<Issue>;
}

export interface JobRepository {
  create(data: {
    title: string;
    description: string;
    publicToken: string;
    deadline: Date | null;
    brfId: string;
    issueId: string | null;
    category: JobCategory;
    priority: JobPriority;
  }): Promise<Job>;
  findById(id: string): Promise<Job | null>;
  findByPublicToken(token: string): Promise<Job | null>;
  listByBrf(brfId: string): Promise<Job[]>;
  updateStatus(id: string, status: JobStatus): Promise<Job>;
  award(jobId: string, bidId: string): Promise<Job>;
}

export interface BidRepository {
  create(data: {
    jobId: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string | null;
    priceSek: number;
    estimatedDays: number | null;
    message: string | null;
  }): Promise<Bid>;
  findById(id: string): Promise<Bid | null>;
  listByJob(jobId: string): Promise<Bid[]>;
}

export interface ResourceRepository {
  create(data: { name: string; brfId: string }): Promise<Resource>;
  findById(id: string): Promise<Resource | null>;
  listByBrf(brfId: string): Promise<Resource[]>;
}

export interface BookingRepository {
  create(data: {
    resourceId: string;
    userId: string;
    startTime: Date;
    endTime: Date;
  }): Promise<Booking>;
  /** Bookings for a resource that overlap [start, end). */
  findOverlapping(
    resourceId: string,
    start: Date,
    end: Date,
  ): Promise<Booking[]>;
  listByResource(resourceId: string): Promise<Booking[]>;
}

export interface PostRepository {
  create(data: {
    title: string;
    body: string;
    brfId: string;
    authorId: string;
  }): Promise<Post>;
  listByBrf(brfId: string): Promise<Post[]>;
}

export interface DocumentRepository {
  create(data: {
    title: string;
    url: string;
    brfId: string;
  }): Promise<BrfDocument>;
  listByBrf(brfId: string): Promise<BrfDocument[]>;
}
