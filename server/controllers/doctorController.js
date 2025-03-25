const doctorModel = require('../models/doctorModel');
const userModel = require('../models/userModel');

class DoctorController {
  async getAllDoctors(req, res) {
    try {
      const filters = req.query;
      const doctors = await doctorModel.getAllDoctors(filters);
      res.json(doctors);
    } catch (error) {
      console.error('Error getting doctors:', error);
      res.status(500).json({ error: 'Failed to get doctors' });
    }
  }

  async getDoctorById(req, res) {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await doctorModel.getById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      
      // Get the user information
      const user = await userModel.getById(doctor.userId);
      
      res.json({
        ...doctor,
        user: user
      });
    } catch (error) {
      console.error('Error getting doctor:', error);
      res.status(500).json({ error: 'Failed to get doctor' });
    }
  }

  async getDoctorByUserId(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const doctor = await doctorModel.getByUserId(userId);
      
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }
      
      res.json(doctor);
    } catch (error) {
      console.error('Error getting doctor by user ID:', error);
      res.status(500).json({ error: 'Failed to get doctor profile' });
    }
  }

  async createDoctor(req, res) {
    try {
      const doctor = await doctorModel.create(req.body);
      res.status(201).json(doctor);
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      res.status(500).json({ error: 'Failed to create doctor profile' });
    }
  }

  async updateDoctor(req, res) {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await doctorModel.update(doctorId, req.body);
      
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      
      res.json(doctor);
    } catch (error) {
      console.error('Error updating doctor:', error);
      res.status(500).json({ error: 'Failed to update doctor' });
    }
  }
}

module.exports = new DoctorController();