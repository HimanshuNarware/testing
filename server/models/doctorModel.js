const { storage } = require('../storage');

class DoctorModel {
  async getById(id) {
    return await storage.getDoctorProfile(id);
  }

  async getByUserId(userId) {
    return await storage.getDoctorProfileByUserId(userId);
  }

  async getAllDoctors(filters) {
    return await storage.getAllDoctors(filters);
  }

  async create(profileData) {
    return await storage.createDoctorProfile(profileData);
  }

  async update(id, profileData) {
    return await storage.updateDoctorProfile(id, profileData);
  }
}

module.exports = new DoctorModel();