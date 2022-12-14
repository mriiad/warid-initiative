import { model, Schema } from 'mongoose';
import { GenderType } from '../utils/enums';
/**
 * Represents information about warid's activities and news to be shared for the upcoming events
 */
export interface IUser {
	_id: string; // auto-generated by mongodb
	username: string;
	firstName: string;
	lastName: string;
	birthDate: Date;
	gender: GenderType;
	email: string;
	password: string;
	phoneNumber: Number;
	isAdmin: boolean;
	isActive: boolean;
	confirmationCode: string;
}

const userSchema = new Schema<IUser>({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	birthDate: {
		type: Date,
		required: true,
	},
	gender: {
		type: String,
		enum: GenderType,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	phoneNumber: {
		type: Number,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		required: true,
	},
	isActive: {
		type: Boolean,
		required: true,
	},
	confirmationCode: {
		type: String,
		unique: true,
	},
});

export const User = model<IUser>('User', userSchema);
