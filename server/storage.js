/**
 * This file provides the in-memory storage implementation for the application.
 * It serves as the data layer and implements all methods defined in the IStorage interface.
 */

// Import schema types from shared schema
const {
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
  insertPrescriptionSchema,
} = require("../shared/schema");

/**
 * Interface for storage operations
 */
class IStorage {
  // User operations
  async getUser(id) {}
  async getUserByUsername(username) {}
  async createUser(user) {}
  async updateUser(id, user) {}
  
  // Doctor operations
  async getDoctorProfile(id) {}
  async getDoctorProfileByUserId(userId) {}
  async createDoctorProfile(profile) {}
  async updateDoctorProfile(id, profile) {}
  async getAllDoctors(filters) {}
  
  // Appointment operations
  async getAppointment(id) {}
  async getAppointmentsByDoctor(doctorId) {}
  async getAppointmentsByPatient(patientId) {}
  async createAppointment(appointment) {}
  async updateAppointment(id, appointment) {}
  
  // Review operations
  async getReview(id) {}
  async getReviewsByDoctor(doctorId) {}
  async createReview(review) {}
  
  // Forum operations
  async getForumTopic(id) {}
  async getForumTopics() {}
  async createForumTopic(topic) {}
  async getForumReplies(topicId) {}
  async createForumReply(reply) {}
  
  // Blog operations
  async getBlogPost(id) {}
  async getBlogPosts() {}
  async createBlogPost(post) {}
  
  // Video operations
  async getVideoReel(id) {}
  async getVideoReels() {}
  async createVideoReel(video) {}
  async incrementVideoViews(id) {}
  
  // Medical Records operations
  async getMedicalRecord(id) {}
  async getMedicalRecordsByPatient(patientId) {}
  async createMedicalRecord(record) {}
  
  // Prescription operations
  async getPrescription(id) {}
  async getPrescriptionsByPatient(patientId) {}
  async createPrescription(prescription) {}
  async updatePrescription(id, prescription) {}
}

/**
 * In-memory implementation of the storage interface
 */
class MemStorage extends IStorage {
  constructor() {
    super();
    
    // Initialize in-memory data stores
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
    
    // ID counters for each entity
    this.currentIds = {
      user: 0,
      doctorProfile: 0,
      appointment: 0,
      review: 0,
      forumTopic: 0,
      forumReply: 0,
      blogPost: 0,
      videoReel: 0,
      medicalRecord: 0,
      prescription: 0
    };
    
    // Seed with initial data
    this.seedData();
  }

  async getUser(id) {
    return this.users.get(id);
  }

  async getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser) {
    const id = ++this.currentIds.user;
    const user = { 
      ...insertUser, 
      id,
      isDoctor: insertUser.isDoctor || false,
      phone: insertUser.phone || null,
      profileImage: insertUser.profileImage || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id, userData) {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getDoctorProfile(id) {
    return this.doctorProfiles.get(id);
  }

  async getDoctorProfileByUserId(userId) {
    for (const profile of this.doctorProfiles.values()) {
      if (profile.userId === userId) {
        return profile;
      }
    }
    return undefined;
  }

  async createDoctorProfile(profile) {
    const id = ++this.currentIds.doctorProfile;
    const doctorProfile = { 
      ...profile, 
      id,
      rating: profile.rating || null,
      reviewCount: profile.reviewCount || null,
      distance: profile.distance || null
    };
    this.doctorProfiles.set(id, doctorProfile);
    return doctorProfile;
  }

  async updateDoctorProfile(id, profileData) {
    const profile = this.doctorProfiles.get(id);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.doctorProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async getAllDoctors(filters = {}) {
    let doctors = Array.from(this.doctorProfiles.values());
    
    // Apply filters if provided
    if (Object.keys(filters).length > 0) {
      doctors = doctors.filter(doctor => {
        for (const [key, value] of Object.entries(filters)) {
          // Special case for specialty, allow partial match
          if (key === 'specialty' && doctor.specialty) {
            const specialties = doctor.specialty.toLowerCase().split(',').map(s => s.trim());
            if (!specialties.some(s => s.includes(value.toLowerCase()))) {
              return false;
            }
          } 
          // Boolean filters
          else if (typeof value === 'boolean') {
            if (doctor[key] !== value) return false;
          }
          // Exact match for other filters
          else if (doctor[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Join with user data
    return Promise.all(doctors.map(async (doctor) => {
      const user = await this.getUser(doctor.userId);
      return { ...doctor, user: { ...user, password: undefined } };
    }));
  }

  async getAppointment(id) {
    return this.appointments.get(id);
  }

  async getAppointmentsByDoctor(doctorId) {
    const result = [];
    for (const appointment of this.appointments.values()) {
      if (appointment.doctorId === doctorId) {
        result.push(appointment);
      }
    }
    return result;
  }

  async getAppointmentsByPatient(patientId) {
    const result = [];
    for (const appointment of this.appointments.values()) {
      if (appointment.patientId === patientId) {
        result.push(appointment);
      }
    }
    return result;
  }

  async createAppointment(appointmentData) {
    const id = ++this.currentIds.appointment;
    const appointment = { 
      ...appointmentData, 
      id,
      status: appointmentData.status || 'scheduled',
      notes: appointmentData.notes || null
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id, appointmentData) {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async getReview(id) {
    return this.reviews.get(id);
  }

  async getReviewsByDoctor(doctorId) {
    const result = [];
    for (const review of this.reviews.values()) {
      if (review.doctorId === doctorId) {
        result.push(review);
      }
    }
    return result;
  }

  async createReview(reviewData) {
    const id = ++this.currentIds.review;
    const review = { 
      ...reviewData, 
      id,
      comment: reviewData.comment || null
    };
    this.reviews.set(id, review);
    
    // Update doctor rating and review count
    const doctorId = reviewData.doctorId;
    const doctorProfile = await this.getDoctorProfile(doctorId);
    if (doctorProfile) {
      const reviews = await this.getReviewsByDoctor(doctorId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      await this.updateDoctorProfile(doctorId, {
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: reviews.length
      });
    }
    
    return review;
  }

  async getForumTopic(id) {
    return this.forumTopics.get(id);
  }

  async getForumTopics() {
    const topics = Array.from(this.forumTopics.values());
    
    // Join with author data
    return Promise.all(topics.map(async (topic) => {
      const author = await this.getUser(topic.authorId);
      return { 
        ...topic, 
        author: { 
          id: author.id,
          name: `${author.firstName} ${author.lastName}`,
          profileImage: author.profileImage,
          isDoctor: author.isDoctor
        } 
      };
    }));
  }

  async createForumTopic(topicData) {
    const id = ++this.currentIds.forumTopic;
    const topic = { 
      ...topicData, 
      id, 
      replyCount: 0,
      isActive: topicData.isActive !== undefined ? topicData.isActive : true
    };
    this.forumTopics.set(id, topic);
    return topic;
  }

  async getForumReplies(topicId) {
    const replies = [];
    for (const reply of this.forumReplies.values()) {
      if (reply.topicId === topicId) {
        replies.push(reply);
      }
    }
    
    // Join with author data
    return Promise.all(replies.map(async (reply) => {
      const author = await this.getUser(reply.authorId);
      return { 
        ...reply, 
        author: { 
          id: author.id,
          name: `${author.firstName} ${author.lastName}`,
          profileImage: author.profileImage,
          isDoctor: author.isDoctor
        } 
      };
    }));
  }

  async createForumReply(replyData) {
    const id = ++this.currentIds.forumReply;
    const reply = { ...replyData, id };
    this.forumReplies.set(id, reply);
    
    // Update reply count for the topic
    const topic = await this.getForumTopic(replyData.topicId);
    if (topic) {
      const updatedTopic = { ...topic, replyCount: topic.replyCount + 1 };
      this.forumTopics.set(topic.id, updatedTopic);
    }
    
    return reply;
  }

  async getBlogPost(id) {
    return this.blogPosts.get(id);
  }

  async getBlogPosts() {
    const posts = Array.from(this.blogPosts.values());
    
    // Join with author data
    return Promise.all(posts.map(async (post) => {
      const author = await this.getUser(post.authorId);
      return { 
        ...post, 
        author: { 
          id: author.id,
          name: `${author.firstName} ${author.lastName}`,
          profileImage: author.profileImage,
          isDoctor: author.isDoctor
        } 
      };
    }));
  }

  async createBlogPost(postData) {
    const id = ++this.currentIds.blogPost;
    const post = { 
      ...postData, 
      id,
      image: postData.image || null
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async getVideoReel(id) {
    return this.videoReels.get(id);
  }

  async getVideoReels() {
    const videos = Array.from(this.videoReels.values());
    
    // Join with author data
    return Promise.all(videos.map(async (video) => {
      const author = await this.getUser(video.authorId);
      return { 
        ...video, 
        author: { 
          id: author.id,
          name: `${author.firstName} ${author.lastName}`,
          profileImage: author.profileImage,
          isDoctor: author.isDoctor
        } 
      };
    }));
  }

  async createVideoReel(videoData) {
    const id = ++this.currentIds.videoReel;
    const video = { 
      ...videoData, 
      id, 
      views: 0,
      description: videoData.description || null
    };
    this.videoReels.set(id, video);
    return video;
  }

  async incrementVideoViews(id) {
    const video = this.videoReels.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, views: video.views + 1 };
    this.videoReels.set(id, updatedVideo);
    return updatedVideo;
  }

  async getMedicalRecord(id) {
    return this.medicalRecords.get(id);
  }

  async getMedicalRecordsByPatient(patientId) {
    const result = [];
    for (const record of this.medicalRecords.values()) {
      if (record.patientId === patientId) {
        result.push(record);
      }
    }
    return result;
  }

  async createMedicalRecord(recordData) {
    const id = ++this.currentIds.medicalRecord;
    const record = { ...recordData, id };
    this.medicalRecords.set(id, record);
    return record;
  }

  async getPrescription(id) {
    return this.prescriptions.get(id);
  }

  async getPrescriptionsByPatient(patientId) {
    const result = [];
    for (const prescription of this.prescriptions.values()) {
      if (prescription.patientId === patientId) {
        result.push(prescription);
      }
    }
    return result;
  }

  async createPrescription(prescriptionData) {
    const id = ++this.currentIds.prescription;
    const prescription = { ...prescriptionData, id };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async updatePrescription(id, prescriptionData) {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;
    
    const updatedPrescription = { ...prescription, ...prescriptionData };
    this.prescriptions.set(id, updatedPrescription);
    return updatedPrescription;
  }

  // Seed the database with initial data
  seedData() {
    // Create users
    const user1 = {
      id: 1,
      username: "patient1",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      isDoctor: false,
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    };
    
    const user2 = {
      id: 2,
      username: "drjohnson",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      phone: "123-456-7891",
      isDoctor: true,
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    };
    
    const user3 = {
      id: 3,
      username: "drchen",
      password: "password123",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@example.com",
      phone: "123-456-7892",
      isDoctor: true,
      profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    };
    
    const user4 = {
      id: 4,
      username: "drrodriguez",
      password: "password123",
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez@example.com",
      phone: "123-456-7893",
      isDoctor: true,
      profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    };
    
    // Store users
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(user3.id, user3);
    this.users.set(user4.id, user4);
    this.currentIds.user = 4;
    
    // Create doctor profiles
    const doctor1 = {
      id: 1,
      userId: 2,
      specialty: "Cardiology",
      hospital: "Boston Medical Center",
      address: "123 Main St, Boston, MA",
      bio: "Experienced cardiologist with a focus on preventive care.",
      education: ["Harvard Medical School", "Johns Hopkins Residency"],
      experience: 12,
      acceptsInsurance: ["Blue Cross", "Medicare", "Aetna"],
      offersInPerson: true,
      offersTelehealth: true,
      rating: 4,
      reviewCount: 128,
      distance: null,
      location: "Boston Medical Center (2 mi)",
      name: "Dr. Sarah Johnson"
    };
    
    const doctor2 = {
      id: 2,
      userId: 3,
      specialty: "Dermatology",
      hospital: "Downtown Medical Plaza",
      address: "456 Oak St, Boston, MA",
      bio: "Specializing in both medical and cosmetic dermatology.",
      education: ["Yale Medical School", "UCLA Residency"],
      experience: 8,
      acceptsInsurance: ["Medicare", "Cigna"],
      offersInPerson: true,
      offersTelehealth: false,
      rating: 4,
      reviewCount: 95,
      distance: null,
      location: "Downtown Medical Plaza (2 mi)",
      name: "Dr. Michael Chen"
    };
    
    const doctor3 = {
      id: 3,
      userId: 4,
      specialty: "Pediatrics",
      hospital: "Children's Healthcare Center",
      address: "789 Pine St, Boston, MA",
      bio: "Passionate about providing care for children of all ages.",
      education: ["Stanford Medical School", "Children's Hospital Residency"],
      experience: 15,
      acceptsInsurance: ["Blue Cross", "Cigna", "Aetna"],
      offersInPerson: true,
      offersTelehealth: true,
      rating: 5,
      reviewCount: 211,
      distance: null,
      location: "Children's Healthcare Center (4 mi)",
      name: "Dr. Emily Rodriguez"
    };
    
    // Store doctor profiles
    this.doctorProfiles.set(doctor1.id, doctor1);
    this.doctorProfiles.set(doctor2.id, doctor2);
    this.doctorProfiles.set(doctor3.id, doctor3);
    this.currentIds.doctorProfile = 3;
    
    // Create appointments
    const appointment1 = {
      id: 1,
      doctorId: 1,
      patientId: 1,
      date: new Date("2025-04-05"),
      time: "09:00 AM",
      type: "In-person",
      status: "scheduled",
      notes: "Annual check-up"
    };
    
    const appointment2 = {
      id: 2,
      doctorId: 3,
      patientId: 1,
      date: new Date("2025-04-15"),
      time: "10:30 AM",
      type: "Telehealth",
      status: "scheduled",
      notes: "Follow-up appointment"
    };
    
    // Store appointments
    this.appointments.set(appointment1.id, appointment1);
    this.appointments.set(appointment2.id, appointment2);
    this.currentIds.appointment = 2;
    
    // Create forum topics
    const topic1 = {
      id: 1,
      title: "Managing High Blood Pressure",
      content: "I've recently been diagnosed with high blood pressure. Does anyone have tips for managing it alongside medication?",
      authorId: 1,
      date: new Date("2025-03-01"),
      isActive: true,
      replyCount: 2
    };
    
    const topic2 = {
      id: 2,
      title: "Telehealth experiences",
      content: "I'm considering using telehealth services for my next appointment. What has been your experience with virtual doctor visits?",
      authorId: 1,
      date: new Date("2025-03-10"),
      isActive: true,
      replyCount: 1
    };
    
    const topic3 = {
      id: 3,
      title: "Pediatric check-up frequency",
      content: "How often should I take my 3-year-old for check-ups? Is once a year sufficient?",
      authorId: 1,
      date: new Date("2025-03-15"),
      isActive: true,
      replyCount: 1
    };
    
    // Store forum topics
    this.forumTopics.set(topic1.id, topic1);
    this.forumTopics.set(topic2.id, topic2);
    this.forumTopics.set(topic3.id, topic3);
    this.currentIds.forumTopic = 3;
    
    // Create blog posts
    const blog1 = {
      id: 1,
      title: "Understanding Heart Health",
      content: "Heart disease remains the leading cause of death globally. In this article, we'll explore preventive measures...",
      authorId: 2,
      date: new Date("2025-02-14"),
      image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      readTime: 5
    };
    
    const blog2 = {
      id: 2,
      title: "Skin Care Myths Debunked",
      content: "There are countless skin care myths circulating online. Today, we'll separate fact from fiction...",
      authorId: 3,
      date: new Date("2025-02-20"),
      image: "https://images.unsplash.com/photo-1619972898592-5de41ab55db1?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      readTime: 4
    };
    
    const blog3 = {
      id: 3,
      title: "Childhood Vaccination Schedule",
      content: "Keeping up with your child's vaccination schedule is crucial for their health. Here's what parents need to know...",
      authorId: 4,
      date: new Date("2025-03-01"),
      image: "https://images.unsplash.com/photo-1576765608866-5b51f8509665?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
      readTime: 6
    };
    
    // Store blog posts
    this.blogPosts.set(blog1.id, blog1);
    this.blogPosts.set(blog2.id, blog2);
    this.blogPosts.set(blog3.id, blog3);
    this.currentIds.blogPost = 3;
    
    // Create video reels
    const video1 = {
      id: 1,
      title: "5 Heart-Healthy Foods",
      description: "Dr. Johnson shares the top 5 foods that promote heart health.",
      authorId: 2,
      date: new Date("2025-02-28"),
      thumbnail: "https://images.unsplash.com/photo-1594044302759-1fa23a1d4b53?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://example.com/videos/heart-healthy-foods",
      views: 324
    };
    
    const video2 = {
      id: 2,
      title: "Daily Skin Care Routine",
      description: "Dr. Chen demonstrates a simple daily skin care routine suitable for all skin types.",
      authorId: 3,
      date: new Date("2025-03-05"),
      thumbnail: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://example.com/videos/skin-care-routine",
      views: 512
    };
    
    const video3 = {
      id: 3,
      title: "Fever Management in Children",
      description: "Dr. Rodriguez explains when to be concerned about a child's fever and home management strategies.",
      authorId: 4,
      date: new Date("2025-03-10"),
      thumbnail: "https://images.unsplash.com/photo-1559567350-f3d97c1fc610?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://example.com/videos/child-fever-management",
      views: 278
    };
    
    const video4 = {
      id: 4,
      title: "Understanding Blood Pressure Readings",
      description: "Learn how to interpret your blood pressure numbers with Dr. Johnson.",
      authorId: 2,
      date: new Date("2025-03-15"),
      thumbnail: "https://images.unsplash.com/photo-1638202993928-7d113568c5c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://example.com/videos/blood-pressure-readings",
      views: 196
    };
    
    // Store video reels
    this.videoReels.set(video1.id, video1);
    this.videoReels.set(video2.id, video2);
    this.videoReels.set(video3.id, video3);
    this.videoReels.set(video4.id, video4);
    this.currentIds.videoReel = 4;
    
    // Create medical records
    const record1 = {
      id: 1,
      patientId: 1,
      doctorId: 1,
      date: new Date("2024-09-15"),
      type: "Annual Physical",
      notes: "Blood pressure slightly elevated, recommend diet modifications and follow-up in 3 months.",
      attachments: ["blood_test_results.pdf", "ekg_result.pdf"]
    };
    
    const record2 = {
      id: 2,
      patientId: 1,
      doctorId: 3,
      date: new Date("2024-10-20"),
      type: "Consultation",
      notes: "Patient complained of frequent headaches. Recommended tracking triggers and hydration improvement.",
      attachments: []
    };
    
    const record3 = {
      id: 3,
      patientId: 1,
      doctorId: 1,
      date: new Date("2025-01-10"),
      type: "Follow-up",
      notes: "Blood pressure improved. Continue with current regimen.",
      attachments: ["follow_up_blood_test.pdf"]
    };
    
    // Store medical records
    this.medicalRecords.set(record1.id, record1);
    this.medicalRecords.set(record2.id, record2);
    this.medicalRecords.set(record3.id, record3);
    this.currentIds.medicalRecord = 3;
    
    // Create prescriptions
    const prescription1 = {
      id: 1,
      patientId: 1,
      doctorId: 1,
      medication: "Lisinopril",
      dosage: "10mg",
      instructions: "Take once daily with food",
      startDate: new Date("2024-09-15"),
      endDate: new Date("2025-03-15"),
      refills: 2,
      status: "active"
    };
    
    const prescription2 = {
      id: 2,
      patientId: 1,
      doctorId: 3,
      medication: "Ibuprofen",
      dosage: "400mg",
      instructions: "Take as needed for headache, not to exceed 3 tablets per day",
      startDate: new Date("2024-10-20"),
      endDate: new Date("2024-11-20"),
      refills: 0,
      status: "completed"
    };
    
    // Store prescriptions
    this.prescriptions.set(prescription1.id, prescription1);
    this.prescriptions.set(prescription2.id, prescription2);
    this.currentIds.prescription = 2;
  }
}

// Export a singleton instance
const storage = new MemStorage();

module.exports = { 
  IStorage,
  MemStorage,
  storage
};