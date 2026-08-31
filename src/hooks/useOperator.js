/**
 * useOperator Hook
 * Custom hook for managing operators
 * Provides easy access to operator data for Commission and Markup components
 */

import { useState, useEffect, useCallback } from 'react';
import operatorService from '../services/operatorService';
import { message } from 'antd';

export const useOperator = (autoLoad = true) => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load all operators
   */
  const loadOperators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await operatorService.getAllOperators();
      if (response.success && response.data) {
        setOperators(response.data);
        return response.data;
      } else {
        setError(response.message || 'Failed to load operators');
        message.error(response.message || 'Failed to load operators');
        return [];
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to load operators';
      setError(errorMsg);
      message.error(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add new operator
   */
  const addOperator = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operatorService.addOperator(data);
      if (response.success) {
        message.success('Operator added successfully');
        await loadOperators(); // Reload the list
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to add operator');
        message.error(response.message || 'Failed to add operator');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to add operator';
      setError(errorMsg);
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update operator
   */
  const updateOperator = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operatorService.updateOperator(id, data);
      if (response.success) {
        message.success('Operator updated successfully');
        await loadOperators(); // Reload the list
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update operator');
        message.error(response.message || 'Failed to update operator');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update operator';
      setError(errorMsg);
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete operator
   */
  const deleteOperator = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operatorService.deleteOperator(id);
      if (response.success) {
        message.success('Operator deleted successfully');
        await loadOperators(); // Reload the list
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete operator');
        message.error(response.message || 'Failed to delete operator');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete operator';
      setError(errorMsg);
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get operator by airline code
   */
  const getOperatorByCode = useCallback(
    (airLineCode) => {
      return operators.find(
        (op) => op.airLineCode?.toUpperCase() === airLineCode?.toUpperCase()
      );
    },
    [operators]
  );

  /**
   * Get operator by airline name
   */
  const getOperatorByName = useCallback(
    (airLineName) => {
      return operators.find(
        (op) =>
          op.airLineName?.toLowerCase() === airLineName?.toLowerCase()
      );
    },
    [operators]
  );

  /**
   * Get formatted operator options for Select component
   */
  const getOperatorOptions = useCallback(() => {
    return operators.map((op) => ({
      value: op.id,
      label: `${op.airLineName} (${op.airLineCode})`,
      airLineCode: op.airLineCode,
      airLineName: op.airLineName,
    }));
  }, [operators]);

  /**
   * Get operator codes only
   */
  const getOperatorCodes = useCallback(() => {
    return operators.map((op) => op.airLineCode);
  }, [operators]);

  /**
   * Check if operator exists by code
   */
  const operatorExists = useCallback(
    (airLineCode) => {
      return operators.some(
        (op) => op.airLineCode?.toUpperCase() === airLineCode?.toUpperCase()
      );
    },
    [operators]
  );

  // Auto-load operators on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      loadOperators();
    }
  }, [autoLoad, loadOperators]);

  return {
    operators,
    loading,
    error,
    loadOperators,
    addOperator,
    updateOperator,
    deleteOperator,
    getOperatorByCode,
    getOperatorByName,
    getOperatorOptions,
    getOperatorCodes,
    operatorExists,
  };
};

export default useOperator;
