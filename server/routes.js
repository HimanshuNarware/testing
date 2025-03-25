const { createServer } = require("http");
const { storage } = require("./storage.js");
const { 
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
} = require("../shared/schema");
const { z } = require("zod");
const { fromZodError } = require("zod-validation-error");
const recommendationService = require('./services/recommendationService');

async function registerRoutes(app) {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
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
  
  app.post("/api/users", async (req, res) => {
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
  
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Partially update user data
      const updatedUser = await storage.updateUser(id, req.body);
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Authentication route
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const filters = {};
      
      // Extract filters from query parameters
      if (req.query.specialty) filters.specialty = req.query.specialty;
      if (req.query.offersInPerson === 'true') filters.offersInPerson = true;
      if (req.query.offersTelehealth === 'true') filters.offersTelehealth = true;
      
      const doctors = await storage.getAllDoctors(filters);
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      const doctor = await storage.getDoctorProfile(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      const user = await storage.getUser(doctor.userId);
      
      res.json({ ...doctor, user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/doctors", async (req, res) => {
    try {
      const profileData = insertDoctorProfileSchema.parse(req.body);
      const doctor = await storage.createDoctorProfile(profileData);
      res.status(201).json(doctor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });
  
  // Recommendation API endpoints
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { 
        userId, 
        query, 
        location, 
        specialty, 
        limit = 10
      } = req.query;
      
      // Parse filters from query params
      const filters = {};
      if (specialty) filters.specialty = specialty;
      
      // Parse userId to integer if provided
      const userIdInt = userId ? parseInt(userId) : null;
      
      // Get recommendations using the service
      const recommendations = await recommendationService.getRecommendations(
        userIdInt,
        query || '',
        location || '',
        filters,
        parseInt(limit)
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error('Recommendation error:', error);
      res.status(500).json({ message: "Error generating recommendations" });
    }
  });
  
  app.get("/api/recommendations/trending", async (req, res) => {
    try {
      const { limit = 5 } = req.query;
      const trending = await recommendationService.getTrendingDoctors(parseInt(limit));
      res.json(trending);
    } catch (error) {
      console.error('Trending doctors error:', error);
      res.status(500).json({ message: "Error getting trending doctors" });
    }
  });
  
  app.get("/api/recommendations/similar/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      const { limit = 3 } = req.query;
      const similarDoctors = await recommendationService.getSimilarDoctors(
        doctorId, 
        parseInt(limit)
      );
      
      res.json(similarDoctors);
    } catch (error) {
      console.error('Similar doctors error:', error);
      res.status(500).json({ message: "Error finding similar doctors" });
    }
  });
  
  // Appointment routes
  app.get("/api/appointments/doctor/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/appointments/patient/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const appointments = await storage.getAppointmentsByPatient(patientId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/appointments", async (req, res) => {
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
  
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      const updatedAppointment = await storage.updateAppointment(id, req.body);
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review routes
  app.get("/api/reviews/doctor/:doctorId", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) {
        return res.status(400).json({ message: "Invalid doctor ID" });
      }
      
      const reviews = await storage.getReviewsByDoctor(doctorId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/reviews", async (req, res) => {
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
  app.get("/api/forum/topics", async (req, res) => {
    try {
      const topics = await storage.getForumTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/forum/topics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const topic = await storage.getForumTopic(id);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      const replies = await storage.getForumReplies(id);
      
      res.json({ topic, replies });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/forum/topics", async (req, res) => {
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
  
  app.post("/api/forum/replies", async (req, res) => {
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
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/blog/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/blog/posts", async (req, res) => {
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
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getVideoReels();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const video = await storage.getVideoReel(id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Increment view count
      const updatedVideo = await storage.incrementVideoViews(id);
      
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/videos", async (req, res) => {
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
  app.get("/api/medical-records/patient/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const records = await storage.getMedicalRecordsByPatient(patientId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/medical-records", async (req, res) => {
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
  app.get("/api/prescriptions/patient/:patientId", async (req, res) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const prescriptions = await storage.getPrescriptionsByPatient(patientId);
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/prescriptions", async (req, res) => {
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
  
  app.patch("/api/prescriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid prescription ID" });
      }
      
      const prescription = await storage.getPrescription(id);
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      const updatedPrescription = await storage.updatePrescription(id, req.body);
      res.json(updatedPrescription);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create an HTTP server
  const server = createServer(app);
  return server;
}

module.exports = { registerRoutes };