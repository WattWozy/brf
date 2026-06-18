// Prisma-backed implementations of the domain repository ports.
// All mapping between Prisma rows and domain entities lives here, so the
// domain never sees a Prisma type.

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
  User,
} from "@/core/domain/entities";
import type {
  BidRepository,
  BookingRepository,
  BrfRepository,
  DocumentRepository,
  IssueRepository,
  JobRepository,
  NewUser,
  PostRepository,
  ResourceRepository,
  UserRepository,
} from "@/core/ports/repositories";
import { ConflictError } from "@/core/domain/errors";
import { prisma } from "./client";

type Db = typeof prisma;

// --- mappers ---------------------------------------------------------------

function toUser(row: {
  id: string;
  email: string;
  name: string;
  role: string;
  apartment: string | null;
  brfId: string;
}): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as User["role"],
    apartment: row.apartment,
    brfId: row.brfId,
  };
}

// --- repositories ----------------------------------------------------------

export function userRepository(db: Db = prisma): UserRepository {
  return {
    async findById(id) {
      const row = await db.user.findUnique({ where: { id } });
      return row ? toUser(row) : null;
    },
    async findByEmail(email) {
      const row = await db.user.findUnique({ where: { email } });
      if (!row) return null;
      return { ...toUser(row), passwordHash: row.passwordHash };
    },
    async create(data: NewUser) {
      const row = await db.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: data.passwordHash,
          role: data.role,
          apartment: data.apartment,
          brfId: data.brfId,
        },
      });
      return toUser(row);
    },
    async listByBrf(brfId) {
      const rows = await db.user.findMany({
        where: { brfId },
        orderBy: { name: "asc" },
      });
      return rows.map(toUser);
    },
  };
}

export function brfRepository(db: Db = prisma): BrfRepository {
  const toBrf = (row: { id: string; name: string; orgNumber: string | null }): Brf => ({
    id: row.id,
    name: row.name,
    orgNumber: row.orgNumber,
  });
  return {
    async findById(id) {
      const row = await db.brf.findUnique({ where: { id } });
      return row ? toBrf(row) : null;
    },
    async create(data) {
      const row = await db.brf.create({ data });
      return toBrf(row);
    },
  };
}

function toIssue(row: {
  id: string;
  title: string;
  description: string;
  location: string | null;
  imageUrl: string | null;
  status: string;
  brfId: string;
  authorId: string;
  createdAt: Date;
}): Issue {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    imageUrl: row.imageUrl,
    status: row.status as IssueStatus,
    brfId: row.brfId,
    authorId: row.authorId,
    createdAt: row.createdAt,
  };
}

export function issueRepository(db: Db = prisma): IssueRepository {
  return {
    async create(data) {
      const row = await db.issue.create({ data });
      return toIssue(row);
    },
    async findById(id) {
      const row = await db.issue.findUnique({ where: { id } });
      return row ? toIssue(row) : null;
    },
    async listByBrf(brfId) {
      const rows = await db.issue.findMany({
        where: { brfId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toIssue);
    },
    async updateStatus(id, status) {
      const row = await db.issue.update({ where: { id }, data: { status } });
      return toIssue(row);
    },
  };
}

function toJob(row: {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  priority: string;
  publicToken: string;
  deadline: Date | null;
  brfId: string;
  issueId: string | null;
  awardedBidId: string | null;
  createdAt: Date;
}): Job {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as JobStatus,
    category: row.category as JobCategory,
    priority: row.priority as JobPriority,
    publicToken: row.publicToken,
    deadline: row.deadline,
    brfId: row.brfId,
    issueId: row.issueId,
    awardedBidId: row.awardedBidId,
    createdAt: row.createdAt,
  };
}

export function jobRepository(db: Db = prisma): JobRepository {
  return {
    async create(data) {
      try {
        const row = await db.job.create({ data });
        return toJob(row);
      } catch (e: unknown) {
        if (
          e instanceof Error &&
          "code" in e &&
          (e as { code: string }).code === "P2002" &&
          data.issueId
        ) {
          throw new ConflictError("Felanmälan har redan ett kopplat uppdrag.");
        }
        throw e;
      }
    },
    async findById(id) {
      const row = await db.job.findUnique({ where: { id } });
      return row ? toJob(row) : null;
    },
    async findByPublicToken(publicToken) {
      const row = await db.job.findUnique({ where: { publicToken } });
      return row ? toJob(row) : null;
    },
    async listByBrf(brfId) {
      const rows = await db.job.findMany({
        where: { brfId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toJob);
    },
    async updateStatus(id, status) {
      const row = await db.job.update({ where: { id }, data: { status } });
      return toJob(row);
    },
    async award(jobId, bidId) {
      const row = await db.job.update({
        where: { id: jobId },
        data: { awardedBidId: bidId, status: "TILLDELAT" },
      });
      return toJob(row);
    },
  };
}

function toBid(row: {
  id: string;
  jobId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  priceSek: number;
  estimatedDays: number | null;
  message: string | null;
  createdAt: Date;
}): Bid {
  return {
    id: row.id,
    jobId: row.jobId,
    companyName: row.companyName,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    priceSek: row.priceSek,
    estimatedDays: row.estimatedDays,
    message: row.message,
    createdAt: row.createdAt,
  };
}

export function bidRepository(db: Db = prisma): BidRepository {
  return {
    async create(data) {
      const row = await db.bid.create({ data });
      return toBid(row);
    },
    async findById(id) {
      const row = await db.bid.findUnique({ where: { id } });
      return row ? toBid(row) : null;
    },
    async listByJob(jobId) {
      const rows = await db.bid.findMany({
        where: { jobId },
        orderBy: { priceSek: "asc" },
      });
      return rows.map(toBid);
    },
  };
}

export function resourceRepository(db: Db = prisma): ResourceRepository {
  const toResource = (row: { id: string; name: string; brfId: string }): Resource => ({
    id: row.id,
    name: row.name,
    brfId: row.brfId,
  });
  return {
    async create(data) {
      const row = await db.resource.create({ data });
      return toResource(row);
    },
    async findById(id) {
      const row = await db.resource.findUnique({ where: { id } });
      return row ? toResource(row) : null;
    },
    async listByBrf(brfId) {
      const rows = await db.resource.findMany({
        where: { brfId },
        orderBy: { name: "asc" },
      });
      return rows.map(toResource);
    },
  };
}

function toBooking(row: {
  id: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
}): Booking {
  return {
    id: row.id,
    resourceId: row.resourceId,
    userId: row.userId,
    startTime: row.startTime,
    endTime: row.endTime,
  };
}

export function bookingRepository(db: Db = prisma): BookingRepository {
  return {
    async create(data) {
      const row = await db.booking.create({ data });
      return toBooking(row);
    },
    async findOverlapping(resourceId, start, end) {
      // overlap iff existing.start < end AND existing.end > start
      const rows = await db.booking.findMany({
        where: {
          resourceId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });
      return rows.map(toBooking);
    },
    async listByResource(resourceId) {
      const rows = await db.booking.findMany({
        where: { resourceId },
        orderBy: { startTime: "asc" },
      });
      return rows.map(toBooking);
    },
  };
}

export function postRepository(db: Db = prisma): PostRepository {
  const toPost = (row: {
    id: string;
    title: string;
    body: string;
    brfId: string;
    authorId: string;
    createdAt: Date;
  }): Post => ({
    id: row.id,
    title: row.title,
    body: row.body,
    brfId: row.brfId,
    authorId: row.authorId,
    createdAt: row.createdAt,
  });
  return {
    async create(data) {
      const row = await db.post.create({ data });
      return toPost(row);
    },
    async listByBrf(brfId) {
      const rows = await db.post.findMany({
        where: { brfId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toPost);
    },
  };
}

export function documentRepository(db: Db = prisma): DocumentRepository {
  const toDoc = (row: {
    id: string;
    title: string;
    url: string;
    brfId: string;
    createdAt: Date;
  }): BrfDocument => ({
    id: row.id,
    title: row.title,
    url: row.url,
    brfId: row.brfId,
    createdAt: row.createdAt,
  });
  return {
    async create(data) {
      const row = await db.document.create({ data });
      return toDoc(row);
    },
    async listByBrf(brfId) {
      const rows = await db.document.findMany({
        where: { brfId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toDoc);
    },
  };
}
