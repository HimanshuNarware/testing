import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertDoctorProfileSchema,
  insertAppointmentSchema,
  insertReviewSchema,
  insertForumTopicSchema,
  insertForumReplySchema,
  insertBlogPostSchema,
  insertVideoReelSchema,
  insertMedicalRecordSchema,
  insertPrescriptionSchema,
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ ...user, password: undefined });
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const userData = req.body;
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    res.json({ ...user, password: undefined });
  });
  
  // Doctor routes
  app.get("/api/doctors", async (req: Request, res: Response) => {
    const { specialty, offersInPerson, offersTelehealth } = req.query;
    
    let filters: any = {};
    
    if (specialty) {
      filters.specialty = specialty as string;
    }
    
    if (offersInPerson) {
      filters.offersInPerson = offersInPerson === 'true';
    }
    
    if (offersTelehealth) {
      filters.offersTelehealth = offersTelehealth === 'true';
    }
    
    const doctors = await storage.getAllDoctors(filters);
    
    // Map doctors to the format expected by the client
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor.id,
      userId: doctor.userId,
      name: `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`,
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      location: `${doctor.hospital} (${doctor.distance} mi)`,
      profileImage: doctor.user.profileImage,
      rating: doctor.rating,
      reviewCount: doctor.reviewCount,
      offersInPerson: doctor.offersInPerson,
      offersTelehealth: doctor.offersTelehealth,
      acceptsInsurance: doctor.acceptsInsurance,
      bio: doctor.bio,
      education: doctor.education,
      experience: doctor.experience,
    }));
    
    res.json(formattedDoctors);
  });
  
  app.get("/api/doctors/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }
    
    const doctor = await storage.getDoctorProfile(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    const user = await storage.getUser(doctor.userId);
    if (!user) {
      return res.status(404).json({ message: "Doctor user not found" });
    }
    
    res.json({
      id: doctor.id,
      userId: doctor.userId,
      name: `Dr. ${user.firstName} ${user.lastName}`,
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      location: `${doctor.hospital} (${doctor.distance} mi)`,
      profileImage: user.profileImage,
      rating: doctor.rating,
      reviewCount: doctor.reviewCount,
      offersInPerson: doctor.offersInPerson,
      offersTelehealth: doctor.offersTelehealth,
      acceptsInsurance: doctor.acceptsInsurance,
      bio: doctor.bio,
      education: doctor.education,
      experience: doctor.experience,
    });
  });
  
  app.post("/api/doctors", async (req: Request, res: Response) => {
    try {
      const doctorData = insertDoctorProfileSchema.parse(req.body);
      const doctor = await storage.createDoctorProfile(doctorData);
      res.status(201).json(doctor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Appointment routes
  app.get("/api/appointments/doctor/:doctorId", async (req: Request, res: Response) => {
    const doctorId = parseInt(req.params.doctorId);
    if (isNaN(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }
    
    const appointments = await storage.getAppointmentsByDoctor(doctorId);
    res.json(appointments);
  });
  
  app.get("/api/appointments/patient/:patientId", async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    
    const appointments = await storage.getAppointmentsByPatient(patientId);
    
    // Get doctor details for each appointment
    const appointmentsWithDoctors = await Promise.all(appointments.map(async (appointment) => {
      const doctor = await storage.getDoctorProfile(appointment.doctorId);
      const user = doctor ? await storage.getUser(doctor.userId) : null;
      
      return {
        ...appointment,
        doctorName: user ? `Dr. ${user.firstName} ${user.lastName}` : "Unknown Doctor",
        doctorSpecialty: doctor?.specialty || "Unknown Specialty",
        doctorProfileImage: user?.profileImage || "",
      };
    }));
    
    res.json(appointmentsWithDoctors);
  });
  
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.patch("/api/appointments/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    
    try {
      const appointmentData = req.body;
      const updatedAppointment = await storage.updateAppointment(id, appointmentData);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review routes
  app.get("/api/reviews/doctor/:doctorId", async (req: Request, res: Response) => {
    const doctorId = parseInt(req.params.doctorId);
    if (isNaN(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }
    
    const reviews = await storage.getReviewsByDoctor(doctorId);
    
    // Get patient details for each review
    const reviewsWithPatients = await Promise.all(reviews.map(async (review) => {
      const patient = await storage.getUser(review.patientId);
      
      return {
        ...review,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Anonymous User",
        patientProfileImage: patient?.profileImage || "",
      };
    }));
    
    res.json(reviewsWithPatients);
  });
  
  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Forum routes
  app.get("/api/forum/topics", async (req: Request, res: Response) => {
    const topics = await storage.getForumTopics();
    res.json(topics);
  });
  
  app.get("/api/forum/topics/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid topic ID" });
    }
    
    const topic = await storage.getForumTopic(id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    
    const author = await storage.getUser(topic.authorId);
    const replies = await storage.getForumReplies(id);
    
    res.json({
      ...topic,
      author: author ? {
        id: author.id,
        name: `${author.firstName} ${author.lastName}`,
        profileImage: author.profileImage,
        isDoctor: author.isDoctor,
      } : undefined,
      replies,
    });
  });
  
  app.post("/api/forum/topics", async (req: Request, res: Response) => {
    try {
      const topicData = insertForumTopicSchema.parse(req.body);
      const topic = await storage.createForumTopic(topicData);
      res.status(201).json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.post("/api/forum/replies", async (req: Request, res: Response) => {
    try {
      const replyData = insertForumReplySchema.parse(req.body);
      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Blog routes
  app.get("/api/blog/posts", async (req: Request, res: Response) => {
    const posts = await storage.getBlogPosts();
    
    // Format blog posts for the client
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      date: post.date,
      image: post.image,
      readTime: post.readTime,
      author: {
        id: post.author.id,
        name: `${post.author.isDoctor ? 'Dr. ' : ''}${post.author.firstName} ${post.author.lastName}`,
        profileImage: post.author.profileImage,
        isDoctor: post.author.isDoctor,
      },
    }));
    
    res.json(formattedPosts);
  });
  
  app.get("/api/blog/posts/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    const post = await storage.getBlogPost(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const author = await storage.getUser(post.authorId);
    
    res.json({
      ...post,
      author: author ? {
        id: author.id,
        name: `${author.isDoctor ? 'Dr. ' : ''}${author.firstName} ${author.lastName}`,
        profileImage: author.profileImage,
        isDoctor: author.isDoctor,
      } : undefined,
    });
  });
  
  app.post("/api/blog/posts", async (req: Request, res: Response) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Video routes
  app.get("/api/videos", async (req: Request, res: Response) => {
    const videos = await storage.getVideoReels();
    
    // Format videos for the client
    const formattedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      videoUrl: video.videoUrl,
      views: video.views,
      date: video.date,
      author: {
        id: video.author.id,
        name: `${video.author.isDoctor ? 'Dr. ' : ''}${video.author.firstName} ${video.author.lastName}`,
        profileImage: video.author.profileImage,
        isDoctor: video.author.isDoctor,
      },
    }));
    
    res.json(formattedVideos);
  });
  
  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    
    const video = await storage.getVideoReel(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Increment view count
    await storage.incrementVideoViews(id);
    
    const author = await storage.getUser(video.authorId);
    
    res.json({
      ...video,
      author: author ? {
        id: author.id,
        name: `${author.isDoctor ? 'Dr. ' : ''}${author.firstName} ${author.lastName}`,
        profileImage: author.profileImage,
        isDoctor: author.isDoctor,
      } : undefined,
    });
  });
  
  app.post("/api/videos", async (req: Request, res: Response) => {
    try {
      const videoData = insertVideoReelSchema.parse(req.body);
      const video = await storage.createVideoReel(videoData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Medical Records routes
  app.get("/api/medical-records/patient/:patientId", async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    
    const records = await storage.getMedicalRecordsByPatient(patientId);
    res.json(records);
  });
  
  app.post("/api/medical-records", async (req: Request, res: Response) => {
    try {
      const recordData = insertMedicalRecordSchema.parse(req.body);
      const record = await storage.createMedicalRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Prescription routes
  app.get("/api/prescriptions/patient/:patientId", async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Invalid patient ID" });
    }
    
    const prescriptions = await storage.getPrescriptionsByPatient(patientId);
    
    // Get doctor details for each prescription
    const prescriptionsWithDoctors = await Promise.all(prescriptions.map(async (prescription) => {
      const doctor = await storage.getDoctorProfile(prescription.doctorId);
      const user = doctor ? await storage.getUser(doctor.userId) : null;
      
      return {
        ...prescription,
        doctorName: user ? `Dr. ${user.firstName} ${user.lastName}` : "Unknown Doctor",
        doctorSpecialty: doctor?.specialty || "Unknown Specialty",
      };
    }));
    
    res.json(prescriptionsWithDoctors);
  });
  
  app.post("/api/prescriptions", async (req: Request, res: Response) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json(prescription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  app.patch("/api/prescriptions/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prescription ID" });
    }
    
    try {
      const prescriptionData = req.body;
      const updatedPrescription = await storage.updatePrescription(id, prescriptionData);
      
      if (!updatedPrescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      res.json(updatedPrescription);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
