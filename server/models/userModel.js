const { storage } = require('../storage');

class UserModel {
  async getById(id) {
    return await storage.getUser(id);
  }

  async getByUsername(username) {
    return await storage.getUserByUsername(username);
  }

  async create(userData) {
    return await storage.createUser(userData);
  }

  async update(id, userData) {
    return await storage.updateUser(id, userData);
  }
}

module.exports = new UserModel();