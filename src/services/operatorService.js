/**
 * Operator Service
 * Handles all API calls related to Operator management
 * Used for Commission and Markup features
 */

import ApiClient from '../Helpers/ApiClient';

const operatorService = {
  /**
   * Get all operators
   * @returns {Promise} - List of operators
   */
  getAllOperators: async () => {
    try {
      const response = await ApiClient.get('/api/Operator/GetAll');
      return response;
    } catch (error) {
      console.error('Error fetching operators:', error);
      throw error;
    }
  },

  /**
   * Add new operator
   * @param {Object} data - Operator data
   * @param {string} data.airLineName - Airline name
   * @param {string} data.airLineCode - Airline code (2-3 characters)
   * @returns {Promise} - Created operator
   */
  addOperator: async (data) => {
    try {
      const response = await ApiClient.post('/api/Operator/Add', {
        airLineName: data.airLineName,
        airLineCode: data.airLineCode,
      });
      return response;
    } catch (error) {
      console.error('Error adding operator:', error);
      throw error;
    }
  },

  /**
   * Update existing operator
   * @param {number} id - Operator ID
   * @param {Object} data - Updated operator data
   * @param {string} data.airLineName - Airline name
   * @param {string} data.airLineCode - Airline code
   * @returns {Promise} - Updated operator
   */
  updateOperator: async (id, data) => {
    try {
      const response = await ApiClient.put(`/api/Operator/Update/${id}`, {
        airLineName: data.airLineName,
        airLineCode: data.airLineCode,
      });
      return response;
    } catch (error) {
      console.error('Error updating operator:', error);
      throw error;
    }
  },

  /**
   * Delete operator
   * @param {number} id - Operator ID
   * @returns {Promise} - Deletion result
   */
  deleteOperator: async (id) => {
    try {
      const response = await ApiClient.delete(`/api/Operator/Delete/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting operator:', error);
      throw error;
    }
  },

  /**
   * Get operator by ID
   * @param {number} id - Operator ID
   * @returns {Promise} - Operator details
   */
  getOperatorById: async (id) => {
    try {
      const response = await ApiClient.get(`/api/Operator/Get/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching operator:', error);
      throw error;
    }
  },

  /**
   * Search operators by airline name or code
   * @param {string} searchTerm - Search term
   * @returns {Promise} - Filtered operators
   */
  searchOperators: async (searchTerm) => {
    try {
      const response = await ApiClient.get('/api/Operator/GetAll');
      if (response.success && response.data) {
        const filtered = response.data.filter(
          (op) =>
            op.airLineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.airLineCode?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { success: true, data: filtered };
      }
      return response;
    } catch (error) {
      console.error('Error searching operators:', error);
      throw error;
    }
  },
};

export default operatorService;
