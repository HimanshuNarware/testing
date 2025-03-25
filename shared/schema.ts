import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Doctor profile schema
export const doctorProfiles = pgTable("doctor_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  hospital: text("hospital").notNull(),
  address: text("address").notNull(),
  bio: text("bio").notNull(),
  education: json("education").$type<string[]>().notNull(),
  experience: integer("experience").notNull(),
  acceptsInsurance: json("accepts_insurance").$type<string[]>().notNull(),
  offersInPerson: boolean("offers_in_person").default(true).notNull(),
  offersTelehealth: boolean("offers_telehealth").default(false).notNull(),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  distance: integer("distance").default(0),
});

export const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).omit({
  id: true,
});

// Appointment schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(), // "in-person" or "telehealth"
  status: text("status").default("scheduled").notNull(), // scheduled, completed, cancelled
  notes: text("notes"),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  patientId: integer("patient_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  date: timestamp("date").notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
});

// Forum Topics schema
export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  replyCount: true,
});

// Forum Replies schema
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull().references(() => forumTopics.id),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
});

// Blog Posts schema
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  image: text("image"),
  readTime: integer("read_time").notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
});

// Video Reels schema
export const videoReels = pgTable("video_reels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  authorId: integer("author_id").notNull().references(() => users.id),
  thumbnail: text("thumbnail").notNull(),
  videoUrl: text("video_url").notNull(),
  views: integer("views").default(0).notNull(),
  date: timestamp("date").notNull(),
});

export const insertVideoReelSchema = createInsertSchema(videoReels).omit({
  id: true,
  views: true,
});

// Medical Records schema
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
});

// Prescriptions schema
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => doctorProfiles.id),
  medication: text("medication").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions").notNull(),
  refillsLeft: integer("refills_left").notNull(),
  date: timestamp("date").notNull(),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDoctorProfile = z.infer<typeof insertDoctorProfileSchema>;
export type DoctorProfile = typeof doctorProfiles.$inferSelect;

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;

export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type InsertVideoReel = z.infer<typeof insertVideoReelSchema>;
export type VideoReel = typeof videoReels.$inferSelect;

export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
