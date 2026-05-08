// Validation utilities for frontend forms
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 20;
};

export const validateProjectName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 100;
};

export const validateTaskTitle = (title: string): boolean => {
  return title.length >= 3 && title.length <= 200;
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRegisterForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email address' });
  }

  if (!validateUsername(data.username)) {
    errors.push({ field: 'username', message: 'Username must be 3-20 characters' });
  }

  if (data.nom.length < 3) {
    errors.push({ field: 'nom', message: 'Full name must be at least 3 characters' });
  }

  if (!validatePassword(data.password)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  return errors;
};

export const validateLoginForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email address' });
  }

  if (!data.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};
