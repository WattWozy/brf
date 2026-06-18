// The dependency container passed to use-cases. The web layer wires concrete
// adapters into this shape (see src/infra/container.ts). Use-cases only ever
// see the port interfaces, keeping the domain testable and swappable.

import type {
  BidRepository,
  BookingRepository,
  BrfRepository,
  DocumentRepository,
  IssueRepository,
  JobRepository,
  PostRepository,
  ResourceRepository,
  UserRepository,
} from "../ports/repositories";
import type { PasswordHasher, TokenGenerator } from "../ports/services";

export interface UseCaseContext {
  users: UserRepository;
  brfs: BrfRepository;
  issues: IssueRepository;
  jobs: JobRepository;
  bids: BidRepository;
  resources: ResourceRepository;
  bookings: BookingRepository;
  posts: PostRepository;
  documents: DocumentRepository;
  hasher: PasswordHasher;
  tokens: TokenGenerator;
}
