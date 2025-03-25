const { pgTable, text, serial, integer, boolean, timestamp, json } = require("drizzle-orm/pg-core");
const { createInsertSchema } = require("drizzle-zod");
const { z } = require("zod");

// User schema
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  isDoctor: boolean("is_doctor").default(false).notNull(),
  profileImage: text("profile_image"),
});

const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Doctor profile schema
const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  hospital: text("hospital").notNull(),
  address: text("address").notNull(),
  bio: text("bio").notNull(),
  education: json("education").notNull(),
  experience: integer("experience").notNull(),
  acceptsInsurance: json("accepts_insurance").notNull(),
  offersInPerson: boolean("offers_in_person").default(true).notNull(),
  offersTelehealth: boolean("offers_telehealth").default(false).notNull(),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  distance: integer("distance").default(0),
});

const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).omit({
  id: true,
});

// Appointment schema
const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(), // "in-person" or "telehealth"
  status: text("status").default("scheduled").notNull(), // scheduled, completed, cancelled
  notes: text("notes"),
});

const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

// Reviews schema
const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  date: timestamp("date").notNull(),
});

const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
});

// Forum Topics schema
const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
});

const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  replyCount: true,
});

// Forum Replies schema
const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => forumTopics.id),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
});

const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
});

// Blog Posts schema
const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  image: text("image"),
  readTime: integer("read_time").notNull(),
});

const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
});

// Video Reels schema
const videoReels = pgTable("video_reels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  authorId: integer("author_id").notNull().references(() => users.id),
  thumbnail: text("thumbnail").notNull(),
  videoUrl: text("video_url").notNull(),
  views: integer("views").default(0).notNull(),
  date: timestamp("date").notNull(),
});

const insertVideoReelSchema = createInsertSchema(videoReels).omit({
  id: true,
  views: true,
});

// Medical Records schema
const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
});

const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
});

// Prescriptions schema
const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  medication: text("medication").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions").notNull(),
  refillsLeft: integer("refills_left").notNull(),
  date: timestamp("date").notNull(),
});

const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
});

module.exports = {
  users,
  insertUserSchema,
  doctorProfiles,
  insertDoctorProfileSchema,
  appointments,
  insertAppointmentSchema,
  reviews,
  insertReviewSchema,
  forumTopics,
  insertForumTopicSchema,
  forumReplies,
  insertForumReplySchema,
  blogPosts,
  insertBlogPostSchema,
  videoReels,
  insertVideoReelSchema,
  medicalRecords,
  insertMedicalRecordSchema,
  prescriptions,
  insertPrescriptionSchema
};