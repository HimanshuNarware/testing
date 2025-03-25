const { storage } = require('../storage');

class AppointmentModel {
  async getById(id) {
    return await storage.getAppointment(id);
  }

  async getByDoctor(doctorId) {
    return await storage.getAppointmentsByDoctor(doctorId);
  }

  async getByPatient(patientId) {
    return await storage.getAppointmentsByPatient(patientId);
  }

  async create(appointmentData) {
    return await storage.createAppointment(appointmentData);
  }

  async update(id, appointmentData) {
    return await storage.updateAppointment(id, appointmentData);
  }
}

module.exports = new AppointmentModel();