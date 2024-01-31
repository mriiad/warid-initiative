export interface User  {
    _id: string;
    username: string;
    email: string;
    phoneNumber: number;
    gender: 'male' | 'female';
    isAdmin: boolean;
   
  }