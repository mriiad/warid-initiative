/**
 * Emergency Types
 * Centralized types for emergency functionality
 */

export interface EmergencyData {
	bloodGroup: string;
	city: string;
	phoneNumber: string;
	details: string;
}

export interface MatchedUser {
	_id: string;
	phoneNumber: string;
	firstname: string;
	lastname: string;
}
