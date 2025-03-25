import {
  User, InsertUser, users,
  DoctorProfile, InsertDoctorProfile, doctorProfiles,
  Appointment, InsertAppointment, appointments,
  Review, InsertReview, reviews,
  ForumTopic, InsertForumTopic, forumTopics,
  ForumReply, InsertForumReply, forumReplies,
  BlogPost, InsertBlogPost, blogPosts,
  VideoReel, InsertVideoReel, videoReels,
  MedicalRecord, InsertMedicalRecord, medicalRecords,
  Prescription, InsertPrescription, prescriptions
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Doctor operations
  getDoctorProfile(id: number): Promise<DoctorProfile | undefined>;
  getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined>;
  createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile>;
  updateDoctorProfile(id: number, profile: Partial<DoctorProfile>): Promise<DoctorProfile | undefined>;
  getAllDoctors(filters?: Partial<DoctorProfile>): Promise<Array<DoctorProfile & { user: User }>>;
  
  // Appointment operations
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  getAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByDoctor(doctorId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Forum operations
  getForumTopic(id: number): Promise<ForumTopic | undefined>;
  getForumTopics(): Promise<Array<ForumTopic & { author: User }>>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  getForumReplies(topicId: number): Promise<Array<ForumReply & { author: User }>>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  // Blog operations
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPosts(): Promise<Array<BlogPost & { author: User }>>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  
  // Video operations
  getVideoReel(id: number): Promise<VideoReel | undefined>;
  getVideoReels(): Promise<Array<VideoReel & { author: User }>>;
  createVideoReel(video: InsertVideoReel): Promise<VideoReel>;
  incrementVideoViews(id: number): Promise<VideoReel | undefined>;
  
  // Medical Records operations
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  
  // Prescription operations
  getPrescription(id: number): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<Prescription>): Promise<Prescription | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctorProfiles: Map<number, DoctorProfile>;
  private appointments: Map<number, Appointment>;
  private reviews: Map<number, Review>;
  private forumTopics: Map<number, ForumTopic>;
  private forumReplies: Map<number, ForumReply>;
  private blogPosts: Map<number, BlogPost>;
  private videoReels: Map<number, VideoReel>;
  private medicalRecords: Map<number, MedicalRecord>;
  private prescriptions: Map<number, Prescription>;
  
  private currentIds: {
    users: number;
    doctorProfiles: number;
    appointments: number;
    reviews: number;
    forumTopics: number;
    forumReplies: number;
    blogPosts: number;
    videoReels: number;
    medicalRecords: number;
    prescriptions: number;
  };

  constructor() {
    this.users = new Map();
    this.doctorProfiles = new Map();
    this.appointments = new Map();
    this.reviews = new Map();
    this.forumTopics = new Map();
    this.forumReplies = new Map();
    this.blogPosts = new Map();
    this.videoReels = new Map();
    this.medicalRecords = new Map();
    this.prescriptions = new Map();
    
    this.currentIds = {
      users: 1,
      doctorProfiles: 1,
      appointments: 1,
      reviews: 1,
      forumTopics: 1,
      forumReplies: 1,
      blogPosts: 1,
      videoReels: 1,
      medicalRecords: 1,
      prescriptions: 1,
    };
    
    // Add some default data for testing
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Doctor operations
  async getDoctorProfile(id: number): Promise<DoctorProfile | undefined> {
    return this.doctorProfiles.get(id);
  }
  
  async getDoctorProfileByUserId(userId: number): Promise<DoctorProfile | undefined> {
    return Array.from(this.doctorProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createDoctorProfile(profile: InsertDoctorProfile): Promise<DoctorProfile> {
    const id = this.currentIds.doctorProfiles++;
    const doctorProfile: DoctorProfile = { ...profile, id };
    this.doctorProfiles.set(id, doctorProfile);
    return doctorProfile;
  }
  
  async updateDoctorProfile(id: number, profileData: Partial<DoctorProfile>): Promise<DoctorProfile | undefined> {
    const profile = this.doctorProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.doctorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }
  
  async getAllDoctors(filters?: Partial<DoctorProfile>): Promise<Array<DoctorProfile & { user: User }>> {
    let doctorProfiles = Array.from(this.doctorProfiles.values());
    
    // Apply filters if provided
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) {
          doctorProfiles = doctorProfiles.filter(profile => {
            // @ts-ignore: dynamic property access
            return profile[key] === value;
          });
        }
      }
    }
    
    const result = [];
    for (const profile of doctorProfiles) {
      const user = this.users.get(profile.userId);
      if (user) {
        result.push({ ...profile, user });
      }
    }
    
    return result;
  }
  
  // Appointment operations
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.doctorId === doctorId
    );
  }
  
  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      appointment => appointment.patientId === patientId
    );
  }
  
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const id = this.currentIds.appointments++;
    const appointment: Appointment = { ...appointmentData, id };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByDoctor(doctorId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.doctorId === doctorId
    );
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.currentIds.reviews++;
    const review: Review = { ...reviewData, id };
    this.reviews.set(id, review);
    
    // Update doctor's rating
    const doctorReviews = await this.getReviewsByDoctor(reviewData.doctorId);
    const doctorProfile = await this.getDoctorProfile(reviewData.doctorId);
    
    if (doctorProfile) {
      const totalRating = doctorReviews.reduce((sum, r) => sum + r.rating, 0);
      const newRating = Math.round(totalRating / doctorReviews.length);
      await this.updateDoctorProfile(reviewData.doctorId, { 
        rating: newRating,
        reviewCount: doctorReviews.length
      });
    }
    
    return review;
  }
  
  // Forum operations
  async getForumTopic(id: number): Promise<ForumTopic | undefined> {
    return this.forumTopics.get(id);
  }
  
  async getForumTopics(): Promise<Array<ForumTopic & { author: User }>> {
    const topics = Array.from(this.forumTopics.values());
    const result = [];
    
    for (const topic of topics) {
      const author = this.users.get(topic.authorId);
      if (author) {
        result.push({ ...topic, author });
      }
    }
    
    return result;
  }
  
  async createForumTopic(topicData: InsertForumTopic): Promise<ForumTopic> {
    const id = this.currentIds.forumTopics++;
    const topic: ForumTopic = { ...topicData, id, replyCount: 0 };
    this.forumTopics.set(id, topic);
    return topic;
  }
  
  async getForumReplies(topicId: number): Promise<Array<ForumReply & { author: User }>> {
    const replies = Array.from(this.forumReplies.values()).filter(
      reply => reply.topicId === topicId
    );
    
    const result = [];
    for (const reply of replies) {
      const author = this.users.get(reply.authorId);
      if (author) {
        result.push({ ...reply, author });
      }
    }
    
    return result;
  }
  
  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const id = this.currentIds.forumReplies++;
    const reply: ForumReply = { ...replyData, id };
    this.forumReplies.set(id, reply);
    
    // Update topic reply count
    const topic = await this.getForumTopic(replyData.topicId);
    if (topic) {
      const updatedTopic = { ...topic, replyCount: topic.replyCount + 1 };
      this.forumTopics.set(replyData.topicId, updatedTopic);
    }
    
    return reply;
  }
  
  // Blog operations
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async getBlogPosts(): Promise<Array<BlogPost & { author: User }>> {
    const posts = Array.from(this.blogPosts.values());
    const result = [];
    
    for (const post of posts) {
      const author = this.users.get(post.authorId);
      if (author) {
        result.push({ ...post, author });
      }
    }
    
    return result;
  }
  
  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentIds.blogPosts++;
    const post: BlogPost = { ...postData, id };
    this.blogPosts.set(id, post);
    return post;
  }
  
  // Video operations
  async getVideoReel(id: number): Promise<VideoReel | undefined> {
    return this.videoReels.get(id);
  }
  
  async getVideoReels(): Promise<Array<VideoReel & { author: User }>> {
    const videos = Array.from(this.videoReels.values());
    const result = [];
    
    for (const video of videos) {
      const author = this.users.get(video.authorId);
      if (author) {
        result.push({ ...video, author });
      }
    }
    
    return result;
  }
  
  async createVideoReel(videoData: InsertVideoReel): Promise<VideoReel> {
    const id = this.currentIds.videoReels++;
    const video: VideoReel = { ...videoData, id, views: 0 };
    this.videoReels.set(id, video);
    return video;
  }
  
  async incrementVideoViews(id: number): Promise<VideoReel | undefined> {
    const video = this.videoReels.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, views: video.views + 1 };
    this.videoReels.set(id, updatedVideo);
    return updatedVideo;
  }
  
  // Medical Records operations
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecords.get(id);
  }
  
  async getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecords.values()).filter(
      record => record.patientId === patientId
    );
  }
  
  async createMedicalRecord(recordData: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.currentIds.medicalRecords++;
    const record: MedicalRecord = { ...recordData, id };
    this.medicalRecords.set(id, record);
    return record;
  }
  
  // Prescription operations
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }
  
  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(
      prescription => prescription.patientId === patientId
    );
  }
  
  async createPrescription(prescriptionData: InsertPrescription): Promise<Prescription> {
    const id = this.currentIds.prescriptions++;
    const prescription: Prescription = { ...prescriptionData, id };
    this.prescriptions.set(id, prescription);
    return prescription;
  }
  
  async updatePrescription(id: number, prescriptionData: Partial<Prescription>): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;
    
    const updatedPrescription = { ...prescription, ...prescriptionData };
    this.prescriptions.set(id, updatedPrescription);
    return updatedPrescription;
  }

  // Seed data for testing
  private seedData() {
    // Create some users
    const user1: User = {
      id: this.currentIds.users++,
      username: "johndoe",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      isDoctor: false,
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    };
    
    const user2: User = {
      id: this.currentIds.users++,
      username: "sarahjohnson",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah@example.com",
      phone: "123-456-7891",
      isDoctor: true,
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    };
    
    const user3: User = {
      id: this.currentIds.users++,
      username: "michaelchen",
      password: "password123",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael@example.com",
      phone: "123-456-7892",
      isDoctor: true,
      profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    };
    
    const user4: User = {
      id: this.currentIds.users++,
      username: "emilyrodriguez",
      password: "password123",
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily@example.com",
      phone: "123-456-7893",
      isDoctor: true,
      profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    };
    
    // Add users to the map
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
    this.users.set(user4.id, user4);
    
    // Create doctor profiles
    const doctor1: DoctorProfile = {
      id: this.currentIds.doctorProfiles++,
      userId: user2.id,
      specialty: "Cardiology",
      hospital: "Boston Medical Center",
      address: "123 Medical St, Boston, MA",
      bio: "Experienced cardiologist with a focus on preventive care.",
      education: ["Harvard Medical School", "Johns Hopkins Residency"],
      experience: 12,
      acceptsInsurance: ["Blue Cross", "Medicare", "Aetna"],
      offersInPerson: true,
      offersTelehealth: true,
      rating: 4,
      reviewCount: 128,
      distance: 2,
    };
    
    const doctor2: DoctorProfile = {
      id: this.currentIds.doctorProfiles++,
      userId: user3.id,
      specialty: "Dermatology",
      hospital: "Downtown Medical Plaza",
      address: "456 Health Ave, Boston, MA",
      bio: "Specializing in both medical and cosmetic dermatology.",
      education: ["Yale Medical School", "UCLA Residency"],
      experience: 8,
      acceptsInsurance: ["Medicare", "Cigna"],
      offersInPerson: true,
      offersTelehealth: false,
      rating: 4,
      reviewCount: 95,
      distance: 2,
    };
    
    const doctor3: DoctorProfile = {
      id: this.currentIds.doctorProfiles++,
      userId: user4.id,
      specialty: "Pediatrics",
      hospital: "Children's Healthcare Center",
      address: "789 Child Blvd, Boston, MA",
      bio: "Passionate about providing care for children of all ages.",
      education: ["Stanford Medical School", "Children's Hospital Residency"],
      experience: 15,
      acceptsInsurance: ["Blue Cross", "Cigna", "Aetna"],
      offersInPerson: true,
      offersTelehealth: true,
      rating: 5,
      reviewCount: 211,
      distance: 4,
    };
    
    // Add doctor profiles to the map
    this.doctorProfiles.set(doctor1.id, doctor1);
    this.doctorProfiles.set(doctor2.id, doctor2);
    this.doctorProfiles.set(doctor3.id, doctor3);
    
    // Create appointments
    const appointment1: Appointment = {
      id: this.currentIds.appointments++,
      doctorId: doctor1.id,
      patientId: user1.id,
      date: new Date(),
      time: "3:00 PM",
      type: "in-person",
      status: "scheduled",
      notes: "Regular checkup",
    };
    
    const appointment2: Appointment = {
      id: this.currentIds.appointments++,
      doctorId: doctor2.id,
      patientId: user1.id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: "10:30 AM",
      type: "in-person",
      status: "scheduled",
      notes: "Skin exam",
    };
    
    // Add appointments to the map
    this.appointments.set(appointment1.id, appointment1);
    this.appointments.set(appointment2.id, appointment2);
    
    // Create forum topics
    const topic1: ForumTopic = {
      id: this.currentIds.forumTopics++,
      title: "Living with Diabetes: Tips & Support",
      content: "I was recently diagnosed with Type 2 diabetes and would love to hear tips from others managing this condition.",
      authorId: user1.id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      isActive: true,
      replyCount: 24,
    };
    
    const topic2: ForumTopic = {
      id: this.currentIds.forumTopics++,
      title: "Managing Anxiety During COVID-19",
      content: "The pandemic has increased my anxiety levels. What are some coping strategies that have worked for you?",
      authorId: user1.id,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      isActive: true,
      replyCount: 37,
    };
    
    const topic3: ForumTopic = {
      id: this.currentIds.forumTopics++,
      title: "Nutrition for Heart Health",
      content: "Looking for dietary recommendations to improve heart health after a recent scare.",
      authorId: user2.id,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      isActive: false,
      replyCount: 18,
    };
    
    // Add forum topics to the map
    this.forumTopics.set(topic1.id, topic1);
    this.forumTopics.set(topic2.id, topic2);
    this.forumTopics.set(topic3.id, topic3);
    
    // Create blog posts
    const blog1: BlogPost = {
      id: this.currentIds.blogPosts++,
      title: "The Importance of Mental Health Check-ups",
      content: "Regular mental health check-ups are just as important as physical exams...",
      authorId: user4.id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      readTime: 5,
    };
    
    const blog2: BlogPost = {
      id: this.currentIds.blogPosts++,
      title: "Understanding Vaccinations: Facts vs. Myths",
      content: "There's a lot of misinformation about vaccines. Let's set the record straight...",
      authorId: user3.id,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      readTime: 8,
    };
    
    const blog3: BlogPost = {
      id: this.currentIds.blogPosts++,
      title: "Simple Exercises for Better Sleep",
      content: "Struggling with insomnia? These exercises can help you get better sleep...",
      authorId: user2.id,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      image: "https://images.unsplash.com/photo-1493548578639-b0c241186eb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      readTime: 4,
    };
    
    // Add blog posts to the map
    this.blogPosts.set(blog1.id, blog1);
    this.blogPosts.set(blog2.id, blog2);
    this.blogPosts.set(blog3.id, blog3);
    
    // Create video reels
    const video1: VideoReel = {
      id: this.currentIds.videoReels++,
      title: "Tips for Managing Hypertension",
      description: "Simple lifestyle changes to help control high blood pressure.",
      authorId: user2.id,
      thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      videoUrl: "https://example.com/video1.mp4",
      views: 2500000,
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    };
    
    const video2: VideoReel = {
      id: this.currentIds.videoReels++,
      title: "Daily Stretches for Back Pain",
      description: "Easy stretches you can do at home to relieve back pain.",
      authorId: user3.id,
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      videoUrl: "https://example.com/video2.mp4",
      views: 1800000,
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    };
    
    const video3: VideoReel = {
      id: this.currentIds.videoReels++,
      title: "Understanding Childhood Vaccines",
      description: "An overview of recommended vaccines for children and their benefits.",
      authorId: user4.id,
      thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      videoUrl: "https://example.com/video3.mp4",
      views: 3200000,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    };
    
    const video4: VideoReel = {
      id: this.currentIds.videoReels++,
      title: "Mindfulness for Anxiety Relief",
      description: "Simple mindfulness techniques to help manage anxiety.",
      authorId: user2.id,
      thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      videoUrl: "https://example.com/video4.mp4",
      views: 2700000,
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
    };
    
    // Add video reels to the map
    this.videoReels.set(video1.id, video1);
    this.videoReels.set(video2.id, video2);
    this.videoReels.set(video3.id, video3);
    this.videoReels.set(video4.id, video4);
    
    // Create medical records
    const record1: MedicalRecord = {
      id: this.currentIds.medicalRecords++,
      patientId: user1.id,
      title: "Blood Test Results",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      type: "Lab Results",
      content: "All values within normal range.",
    };
    
    const record2: MedicalRecord = {
      id: this.currentIds.medicalRecords++,
      patientId: user1.id,
      title: "Annual Physical Report",
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      type: "Examination",
      content: "Patient in good health. Regular exercise recommended.",
    };
    
    const record3: MedicalRecord = {
      id: this.currentIds.medicalRecords++,
      patientId: user1.id,
      title: "Vaccination Records",
      date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
      type: "Immunization",
      content: "Flu vaccine administered. Due for tetanus booster next year.",
    };
    
    // Add medical records to the map
    this.medicalRecords.set(record1.id, record1);
    this.medicalRecords.set(record2.id, record2);
    this.medicalRecords.set(record3.id, record3);
    
    // Create prescriptions
    const prescription1: Prescription = {
      id: this.currentIds.prescriptions++,
      patientId: user1.id,
      doctorId: doctor1.id,
      medication: "Amoxicillin",
      dosage: "500mg, 3x daily",
      instructions: "Take with food. Complete entire course.",
      refillsLeft: 2,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    };
    
    const prescription2: Prescription = {
      id: this.currentIds.prescriptions++,
      patientId: user1.id,
      doctorId: doctor3.id,
      medication: "Lisinopril",
      dosage: "10mg, 1x daily",
      instructions: "Take in the morning with water.",
      refillsLeft: 5,
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    };
    
    // Add prescriptions to the map
    this.prescriptions.set(prescription1.id, prescription1);
    this.prescriptions.set(prescription2.id, prescription2);
  }
}

export const storage = new MemStorage();
