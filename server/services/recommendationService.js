const { storage } = require('../storage');

/**
 * RecommendationService uses various machine learning techniques to recommend doctors
 * based on search query, user history, and preferences
 */
class RecommendationService {
  constructor() {
    // Keywords for relevant medical specialties matching
    this.specialtyKeywords = {
      'Cardiology': ['heart', 'cardiac', 'chest pain', 'palpitations', 'blood pressure', 'cardiovascular'],
      'Dermatology': ['skin', 'rash', 'acne', 'mole', 'eczema', 'psoriasis', 'melanoma'],
      'Gastroenterology': ['stomach', 'intestine', 'digestive', 'ibs', 'acid reflux', 'abdominal pain'],
      'Neurology': ['brain', 'headache', 'migraine', 'seizure', 'tremor', 'memory', 'neurological'],
      'Orthopedics': ['bone', 'joint', 'fracture', 'back pain', 'osteoporosis', 'arthritis', 'knee', 'hip'],
      'Pediatrics': ['child', 'infant', 'newborn', 'baby', 'kid', 'children'],
      'Obstetrics': ['pregnancy', 'prenatal', 'maternity', 'pregnant', 'obgyn', 'gynecology'],
      'Psychiatry': ['anxiety', 'depression', 'stress', 'mental health', 'adhd', 'mood', 'therapy'],
      'Oncology': ['cancer', 'tumor', 'oncology', 'oncologist', 'lymphoma', 'leukemia'],
      'Ophthalmology': ['eye', 'vision', 'glasses', 'blind', 'sight', 'cataract', 'retina']
    };
  }

  /**
   * Calculate the relevance score between user query and doctor profile
   * @param {string} query - The search query
   * @param {Object} doctor - The doctor profile to check relevance against
   * @returns {number} - Relevance score from 0 to 1
   */
  calculateRelevanceScore(query, doctor) {
    if (!query || query.trim().length === 0) {
      return 0.5; // Medium relevance for empty queries
    }

    const queryLower = query.toLowerCase();
    const tokens = queryLower.split(/\s+/);
    let score = 0;

    // Check specialty match
    if (doctor.specialty) {
      const specialties = doctor.specialty.toLowerCase().split(',').map(s => s.trim());
      
      // Direct specialty match (highest relevance)
      const directSpecialtyMatch = specialties.some(specialty => 
        queryLower.includes(specialty) || specialty.includes(queryLower)
      );
      
      if (directSpecialtyMatch) {
        score += 0.6;
      }
      
      // Keyword-based specialty match
      for (const specialty of specialties) {
        const specialtyKeywords = this.specialtyKeywords[specialty] || [];
        const keywordMatch = specialtyKeywords.some(keyword => 
          queryLower.includes(keyword.toLowerCase())
        );
        
        if (keywordMatch) {
          score += 0.3;
        }
      }
    }
    
    // Check bio for relevant terms
    if (doctor.bio) {
      const bioLower = doctor.bio.toLowerCase();
      const tokenMatches = tokens.filter(token => token.length > 3 && bioLower.includes(token)).length;
      score += tokenMatches * 0.1;
    }
    
    // Consider rating if it exists
    if (doctor.rating) {
      score += (doctor.rating / 5) * 0.2;
    }
    
    // Consider appointment availability (hypothetical feature)
    if (doctor.offersInPerson || doctor.offersTelehealth) {
      score += 0.1;
    }
    
    // Normalize score to 0-1 range
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Get personalized recommendations for a user
   * @param {number} userId - The user ID (null for anonymous)
   * @param {string} query - Search query
   * @param {string} location - Location filter
   * @param {Object} filters - Additional filters like specialty, insurance
   * @param {number} limit - Maximum number of recommendations
   * @returns {Promise<Array>} - Sorted array of recommended doctors
   */
  async getRecommendations(userId, query, location, filters = {}, limit = 10) {
    try {
      // Get all doctors based on initial filters
      const allDoctors = await storage.getAllDoctors(filters);
      
      // Calculate relevance scores
      const scoredDoctors = allDoctors.map(doctor => {
        // Calculate match score for this doctor
        const matchScore = this.calculateRelevanceScore(query, doctor);
        
        // Apply location filter
        let locationScore = 1;
        if (location && doctor.location) {
          locationScore = doctor.location.toLowerCase().includes(location.toLowerCase()) ? 1 : 0.3;
        }
        
        // User-specific recommendations (could be expanded with actual user history)
        let userScore = 1;
        if (userId) {
          // In a real system, we'd have user history data to personalize
          userScore = 1;
        }
        
        // Combined score
        const combinedScore = matchScore * 0.6 + locationScore * 0.3 + userScore * 0.1;
        
        return {
          ...doctor,
          matchScore: combinedScore
        };
      });
      
      // Sort by match score and limit results
      return scoredDoctors
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Get trending doctors based on recent appointment activity
   * @param {number} limit - Maximum number of doctors to return
   * @returns {Promise<Array>} - Array of trending doctors
   */
  async getTrendingDoctors(limit = 5) {
    try {
      // In a real system, we would calculate trending doctors based on:
      // 1. Recent booking frequency
      // 2. Profile view counts
      // 3. Rating changes
      // 4. Review activity
      // 5. Specialty demand
      
      // For this demo, we'll get all doctors and sort by rating and reviewCount
      const allDoctors = await storage.getAllDoctors();
      
      return allDoctors
        .sort((a, b) => {
          // Score = rating * (1 + log(reviewCount))
          const scoreA = (a.rating || 0) * (1 + Math.log(a.reviewCount + 1));
          const scoreB = (b.rating || 0) * (1 + Math.log(b.reviewCount + 1));
          return scoreB - scoreA;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting trending doctors:', error);
      return [];
    }
  }

  /**
   * Get similar doctors to a given doctor
   * @param {number} doctorId - The reference doctor ID
   * @param {number} limit - Maximum number of similar doctors
   * @returns {Promise<Array>} - Array of similar doctors
   */
  async getSimilarDoctors(doctorId, limit = 3) {
    try {
      // Get the reference doctor
      const doctorProfile = await storage.getDoctorProfile(doctorId);
      if (!doctorProfile) {
        return [];
      }
      
      // Get all doctors
      const allDoctors = await storage.getAllDoctors();
      
      // Calculate similarity scores
      const scoredDoctors = allDoctors
        .filter(doctor => doctor.id !== doctorId) // Exclude the reference doctor
        .map(doctor => {
          let similarityScore = 0;
          
          // Specialty match (highest weight)
          if (doctor.specialty && doctorProfile.specialty) {
            const specialtiesA = doctorProfile.specialty.toLowerCase().split(',').map(s => s.trim());
            const specialtiesB = doctor.specialty.toLowerCase().split(',').map(s => s.trim());
            
            // Count matching specialties
            const specialtyMatches = specialtiesA.filter(s => specialtiesB.includes(s)).length;
            similarityScore += (specialtyMatches / Math.max(specialtiesA.length, 1)) * 0.4;
          }
          
          // Similar location
          if (doctor.location && doctorProfile.location &&
              doctor.location.toLowerCase() === doctorProfile.location.toLowerCase()) {
            similarityScore += 0.2;
          }
          
          // Similar experience level
          if (doctor.experience && doctorProfile.experience) {
            const expDiff = Math.abs(doctor.experience - doctorProfile.experience);
            similarityScore += (1 - Math.min(expDiff / 10, 1)) * 0.1;
          }
          
          // Similar insurance acceptance
          if (doctor.acceptsInsurance && doctorProfile.acceptsInsurance) {
            const commonInsurance = doctor.acceptsInsurance.filter(ins => 
              doctorProfile.acceptsInsurance.includes(ins)
            ).length;
            similarityScore += (commonInsurance / Math.max(doctorProfile.acceptsInsurance.length, 1)) * 0.2;
          }
          
          // Similar appointment types
          if (doctor.offersInPerson === doctorProfile.offersInPerson &&
              doctor.offersTelehealth === doctorProfile.offersTelehealth) {
            similarityScore += 0.1;
          }
          
          return {
            ...doctor,
            similarityScore
          };
        });
      
      // Sort by similarity score and limit results
      return scoredDoctors
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding similar doctors:', error);
      return [];
    }
  }
}

// Export a singleton instance
module.exports = new RecommendationService();