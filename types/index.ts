// Global types for the application

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface VaultItem {
  _id: string;
  userId: string;
  title: string;
  username: string;
  encryptedPassword: string;
  url: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeLookAlikes: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  success: boolean;
}
