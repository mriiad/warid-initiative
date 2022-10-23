import { model, Schema } from 'mongoose';
/**
 * Represents information about warid's activities and news to be shared for the upcoming events
 */

export interface IUser {
    username: string;
    email: string;
    phoneNumber: Number;
    isAdmin: boolean;
    isActive: boolean;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    }
})

export const User = model<IUser>('User', userSchema);
