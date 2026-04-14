import { relations } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, pgEnum, date, integer, uniqueIndex, index, unique, boolean, jsonb } from "drizzle-orm/pg-core";

// =========================================
// ENUMS
// =========================================

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "PASTOR",
  "SUPERVISOR",
  "LEADER",
  "ASSISTANT",
]);

export const cellStatusEnum = pgEnum("cell_status", [
  "ACTIVE",
  "PLANTING",
  "PAUSED",
  "CLOSED",
]);



export const genderEnum = pgEnum("gender", ["MALE", "FEMALE", "OTHER"]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "ABSENT",
  "VISITOR",
]);

export const cellGroupTypeEnum = pgEnum("cell_group_type", [
  "CHILDREN",
  "YOUNG_ADULTS",
  "TEENAGERS",
  "ADULTS",
]);

// =========================================
// CHURCHES
// =========================================

export const churches = pgTable("churches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =========================================
// USERS
// =========================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull(),
  churchId: uuid("church_id")
    .notNull()
    .references(() => churches.id, { onDelete: "cascade" }),
  supervisorId: uuid("supervisor_id").references((): any => users.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_users_church").on(table.churchId),
    index("idx_users_supervisor").on(table.supervisorId),
    index("idx_users_active").on(table.churchId, table.isActive),
  ];
});

// =========================================
// CELL GROUPS
// =========================================

export const cellGroups = pgTable("cell_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  churchId: uuid("church_id")
    .notNull()
    .references(() => churches.id, { onDelete: "cascade" }),
  regionId: uuid("region_id"),
  leaderId: uuid("leader_id").references((): any => persons.id, { onDelete: "set null" }),
  coLeaderId: uuid("co_leader_id").references((): any => persons.id, { onDelete: "set null" }),
  hostId: uuid("host_id").references((): any => persons.id, { onDelete: "set null" }),
  supervisorId: uuid("supervisor_id").references((): any => persons.id, { onDelete: "set null" }),
  cellGroupType: cellGroupTypeEnum("cell_group_type").notNull(),
  name: text("name").notNull(),
  meetingDay: text("meeting_day"),
  meetingTime: text("meeting_time"),
  addressLine: text("address_line"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  status: cellStatusEnum("status").notNull().default("ACTIVE"),
  startDate: date("start_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_cells_church").on(table.churchId),
    index("idx_cells_supervisor").on(table.supervisorId),
  ];
});

// =========================================
// PERSONS
// =========================================

export const persons = pgTable("persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  churchId: uuid("church_id")
    .notNull()
    .references(() => churches.id, { onDelete: "cascade" }),
  cellGroupId: uuid("cell_group_id").references(() => cellGroups.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  nickname: text("nickname"),
  phone: text("phone"),
  birthDate: date("birth_date"),
  gender: genderEnum("gender"),
  maritalStatus: text("marital_status"),
  spouseId: uuid("spouse_id").references((): any => persons.id, { onDelete: "set null" }),
  attendsChurch: boolean("attends_church").default(true).notNull(),
  addressLine: text("address_line"),
  neighborhood: text("neighborhood"),

  joinedAt: date("joined_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_persons_church").on(table.churchId),
    index("idx_persons_cell").on(table.cellGroupId),
  ];
});

export const personsRelations = relations(persons, ({ many, one }) => ({
  churchLifeEvents: many(churchLifeEvents),
  spouse: one(persons, {
    fields: [persons.spouseId],
    references: [persons.id],
    relationName: "spouseRelation",
  }),
}));

// =========================================
// CHURCH LIFE EVENTS
// =========================================

export const churchLifeEvents = pgTable("church_life_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_church_life_events_person").on(table.personId),
  ];
});

export const churchLifeEventsRelations = relations(churchLifeEvents, ({ one }) => ({
  person: one(persons, {
    fields: [churchLifeEvents.personId],
    references: [persons.id],
  }),
}));

// =========================================
// MEETINGS
// =========================================

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  cellGroupId: uuid("cell_group_id")
    .notNull()
    .references(() => cellGroups.id, { onDelete: "cascade" }),
  meetingDate: date("meeting_date").notNull(),
  topic: text("topic"),
  initialPrayer: uuid("initial_prayer").references(() => persons.id, { onDelete: "set null" }),
  finalPrayer: uuid("final_prayer").references(() => persons.id, { onDelete: "set null" }),
  responsibleForReflection: uuid("responsible_for_reflection").references(() => persons.id, { onDelete: "set null" }),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  memberCount: integer("member_count").default(0),
  visitorCount: integer("visitor_count").default(0),
  childrenCount: integer("children_count").default(0),
  totalCount: integer("total_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_meetings_cell").on(table.cellGroupId),
  ];
});

// =========================================
// MEETING ATTENDANCE
// =========================================

export const meetingAttendance = pgTable("meeting_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id")
    .notNull()
    .references(() => meetings.id, { onDelete: "cascade" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  status: attendanceStatusEnum("status").notNull(),
  absenceReason: text("absence_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    unique("meeting_attendance_meeting_id_person_id_unique").on(table.meetingId, table.personId),
    index("idx_attendance_meeting").on(table.meetingId),
    index("idx_attendance_person").on(table.personId),
  ];
});

// =========================================
// VISITORS
// =========================================

export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  churchId: uuid("church_id")
    .notNull()
    .references(() => churches.id, { onDelete: "cascade" }),
  cellGroupId: uuid("cell_group_id").references(() => cellGroups.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  invitedByPersonId: uuid("invited_by_person_id").references(() => persons.id, { onDelete: "set null" }),
  firstVisitDate: date("first_visit_date"),
  visitCount: integer("visit_count").default(1),
  followUpDone: boolean("follow_up_done").default(false),
  becameMember: boolean("became_member").default(false),
  interestedInDiscipleship: boolean("interested_in_discipleship").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_visitors_church").on(table.churchId),
    index("idx_visitors_cell").on(table.cellGroupId),
  ];
});

// =========================================
// CELL MEMBERS (NEW)
// =========================================

export const cellMembers = pgTable("cell_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  cellGroupId: uuid("cell_group_id")
    .notNull()
    .references(() => cellGroups.id, { onDelete: "cascade" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => {
  return [
    uniqueIndex("idx_cell_members_unique").on(table.cellGroupId, table.personId),
    index("idx_cell_members_cell").on(table.cellGroupId),
    index("idx_cell_members_person").on(table.personId),
  ];
});

export const cellMembersRelations = relations(cellMembers, ({ one }) => ({
  cellGroup: one(cellGroups, {
    fields: [cellMembers.cellGroupId],
    references: [cellGroups.id],
  }),
  person: one(persons, {
    fields: [cellMembers.personId],
    references: [persons.id],
  }),
}));
