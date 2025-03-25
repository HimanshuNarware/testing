const userModel = require('../models/userModel');

class UserController {
  async getUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userModel.getById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async createUser(req, res) {
    try {
      // Check if username already exists
      const existingUser = await userModel.getByUsername(req.body.username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      
      const user = await userModel.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userModel.update(userId, req.body);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      const user = await userModel.getByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
}

module.exports = new UserController();