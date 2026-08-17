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
	// The backend's getEmergencyMatchUsers has always returned this (see
	// src/controllers/emergency.js), but it was missing here -- so
	// MatchedUsers.tsx quietly declared its own inline copy of this
	// interface with the field added, rather than the shared type being
	// fixed. Two definitions of the same server object, drifting apart.
	bloodGroup: string;
}
