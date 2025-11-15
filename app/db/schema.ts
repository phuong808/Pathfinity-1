import {
  boolean,
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  vector,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

/* User / Auth tables */
export const user = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(), 
  emailVerified: boolean("email_verified"),
  image: text("image"),
  password: text("password"), // Add password field for email authentication
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User profiles / pathways
export const profile = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  career: text("career"),
  college: text("college"),
  major: text("major"),
  degree: text("degree"),
  interests: jsonb("interests"),
  skills: jsonb("skills"),
  roadmap: jsonb("roadmap"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

/* RAG (Retrieval-Augmented Generation) tables */

// Sources represent the origin of documents (files, URLs, datasets)
export const source = pgTable("sources", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  type: text("type").notNull(), // e.g. 'json-file', 'api'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Store only the embeddings and minimal metadata, linked to a source.
export const embedding = pgTable("embeddings", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull().references(() => source.id, { onDelete: "cascade" }),
  refId: text("ref_id"),
  title: text("title"),
  campusId: text("campus_id").references(() => campus.id),
  courseId: integer("course_id").references(() => course.id),
  content: text("content"),
  metadata: jsonb("metadata"),
  contentHash: text("content_hash"),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  index("embedding_vector_idx").using("ivfflat", table.embedding.op("vector_cosine_ops")),
]);


/* Chat / Message Persistence */

// Store chat sessions with user reference
export const chat = pgTable("chats", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title"), // optional, can be generated from first message
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Store individual messages in UIMessage format from AI SDK
export const message = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chat.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: jsonb("content").notNull(), // store complete UIMessage parts array
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* Pathway / Workflow tables */

// Campuses 
export const campus = pgTable("campuses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  instIpeds: text("inst_ipeds"),
  aliases: jsonb("aliases"),
  type: text("type"), // 'university' | 'community_college'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  index("campus_inst_ipeds_idx").on(table.instIpeds),
  index("campus_type_idx").on(table.type),
]);

// Courses offered by campuses - normalized storage
export const course = pgTable("courses", {
  id: serial("id").primaryKey(),
  campusId: text("campus_id").notNull().references(() => campus.id, { onDelete: "cascade" }),
  coursePrefix: text("course_prefix").notNull(),
  courseNumber: text("course_number").notNull(),
  courseTitle: text("course_title"),
  courseDesc: text("course_desc"),
  numUnits: text("num_units"),
  deptName: text("dept_name"),
  metadata: text("metadata"), // Prerequisites, restrictions, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  // Composite index for fast course lookups by prefix + number
  index("course_prefix_number_idx").on(table.coursePrefix, table.courseNumber),
  // Index for campus-specific queries
  index("course_campus_idx").on(table.campusId),
  // Index for department-based filtering
  index("course_dept_idx").on(table.deptName),
  // Unique constraint: one course per campus
  index("course_unique_campus_course").on(table.campusId, table.coursePrefix, table.courseNumber),
]);

// Degree or Certificate codes (B.S., B.A., A.A., UCert, CA, CO, etc.)
export const degree = pgTable("degrees", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name"),
  level: text("level"), // 'baccalaureate' | 'associate' | 'certificate' | 'graduate'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  index("degree_level_idx").on(table.level),
]);

// Degree Programs - represents a specific degree program at a campus
export const degreeProgram = pgTable("degree_programs", {
  id: serial("id").primaryKey(),
  campusId: text("campus_id").notNull().references(() => campus.id, { onDelete: "cascade" }),
  degreeId: integer("degree_id").notNull().references(() => degree.id),
  programName: text("program_name").notNull(), // Full name: "Bachelor of Arts (BA) in Computer Science"
  majorTitle: text("major_title"), // Extracted major: "Computer Science"
  track: text("track"), // Optional track: "Animation Track", "Data Science Track", etc.
  totalCredits: integer("total_credits"),
  typicalDurationYears: integer("typical_duration_years"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  index("degree_program_campus_idx").on(table.campusId),
  index("degree_program_degree_idx").on(table.degreeId),
  index("degree_program_major_idx").on(table.majorTitle),
]);

// Degree Pathway - the structured plan for completing a degree program
export const degreePathway = pgTable("degree_pathways", {
  id: serial("id").primaryKey(),
  degreeProgramId: integer("degree_program_id").notNull().references(() => degreeProgram.id, { onDelete: "cascade" }),
  yearNumber: integer("year_number").notNull(), // 1, 2, 3, 4
  semesterName: text("semester_name").notNull(), // 'fall_semester', 'spring_semester', 'summer_semester'
  semesterCredits: integer("semester_credits"),
  sequenceOrder: integer("sequence_order").notNull(), // For ordering: 1, 2, 3, 4, 5, 6...
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  // Index for fast retrieval of all semesters for a program
  index("pathway_program_idx").on(table.degreeProgramId),
  // Index for sequential ordering
  index("pathway_sequence_idx").on(table.degreeProgramId, table.sequenceOrder),
  // Unique constraint: one record per program + year + semester
  index("pathway_unique_semester").on(table.degreeProgramId, table.yearNumber, table.semesterName),
]);

// Pathway Courses - courses required in each semester of a pathway
export const pathwayCourse = pgTable("pathway_courses", {
  id: serial("id").primaryKey(),
  pathwayId: integer("pathway_id").notNull().references(() => degreePathway.id, { onDelete: "cascade" }),
  courseId: integer("course_id").references(() => course.id, { onDelete: "set null" }), // Null if generic requirement
  courseName: text("course_name").notNull(), // Original name from pathway (e.g., "CINE 255 (DH)", "FQ (or FW)")
  credits: integer("credits").notNull(),
  category: text("category"), // 'FW', 'FQ', 'DA', 'DB', 'DH', 'Concentration', 'Elective', etc.
  isElective: boolean("is_elective").default(false),
  isGenEd: boolean("is_gen_ed").default(false), // Is this a general education requirement?
  notes: text("notes"), // Alternative courses, special notes
  sequenceOrder: integer("sequence_order").notNull(), // Order within the semester
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  // Index for fast retrieval of all courses in a pathway
  index("pathway_course_pathway_idx").on(table.pathwayId),
  // Index for course references
  index("pathway_course_course_idx").on(table.courseId),
  // Index for category filtering (e.g., all FW requirements)
  index("pathway_course_category_idx").on(table.category),
  // Index for sequential ordering within a semester
  index("pathway_course_sequence_idx").on(table.pathwayId, table.sequenceOrder),
]);

// Course Prerequisites - for tracking course dependencies
export const coursePrerequisite = pgTable("course_prerequisites", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => course.id, { onDelete: "cascade" }),
  prerequisiteCourseId: integer("prerequisite_course_id").references(() => course.id, { onDelete: "cascade" }),
  prerequisiteText: text("prerequisite_text"), // Raw text if course not resolved
  isRequired: boolean("is_required").default(true), // vs optional/recommended
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => [
  index("course_prereq_course_idx").on(table.courseId),
  index("course_prereq_prerequisite_idx").on(table.prerequisiteCourseId),
]);
