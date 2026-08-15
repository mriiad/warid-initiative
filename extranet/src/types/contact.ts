/**
 * Contact Types
 * Centralized types for contact functionality
 */

// Matches what src/controllers/contact.js's sendContactUs actually reads
// from req.body. This previously declared a { name, email, subject, message }
// shape that the backend has never read (no `name` field at all; firstname/
// lastname/phoneNumber are required) -- it went uncaught because ContactForm
// called axios directly instead of going through contactService, so nothing
// ever typechecked the real payload against this interface.
export interface ContactData {
	firstname: string;
	lastname: string;
	email: string;
	phoneNumber: string;
	subject: string;
	message: string;
}
