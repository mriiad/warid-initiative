/**
 * MAIN API LAYER
 * Unified export for all API functionality
 * Provides clean imports while maintaining separation of concerns
 */

export * from '../hooks';
export * from '../services';
export * from '../types';
export { apiClient, handleApiError } from '../utils/apiClient';
