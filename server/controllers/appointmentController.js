const appointmentModel = require('../models/appointmentModel');

class AppointmentController {
  async getAppointmentsByDoctor(req, res) {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const appointments = await appointmentModel.getByDoctor(doctorId);
      res.json(appointments);
    } catch (error) {
      console.error('Error getting doctor appointments:', error);
      res.status(500).json({ error: 'Failed to get appointments' });
    }
  }
  
  async getAppointmentsByPatient(req, res) {
    try {
      const patientId = parseInt(req.params.patientId);
      const appointments = await appointmentModel.getByPatient(patientId);
      res.json(appointments);
    } catch (error) {
      console.error('Error getting patient appointments:', error);
      res.status(500).json({ error: 'Failed to get appointments' });
    }
  }
  
  async createAppointment(req, res) {
    try {
      const appointment = await appointmentModel.create(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  }
  
  async updateAppointment(req, res) {
    try {
      const appointmentId = parseInt(req.params.id);
      const appointment = await appointmentModel.update(appointmentId, req.body);
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  }
}

module.exports = new AppointmentController();