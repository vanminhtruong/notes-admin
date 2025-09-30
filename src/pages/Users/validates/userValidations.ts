import type { TFunction } from 'i18next';

export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
}

export interface EditUserForm {
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+\d][\d\s\-()]{5,20}$/;

export function validateCreateUser(data: CreateUserForm, t: TFunction<'users'>) {
  const fieldErrors: Record<string, string> = {};

  if (!data.name?.trim()) {
    fieldErrors.name = t('create.validation.nameRequired');
  }

  if (!data.email?.trim()) {
    fieldErrors.email = t('create.validation.emailRequired');
  } else if (!emailRegex.test(data.email.trim())) {
    fieldErrors.email = t('create.validation.emailInvalid');
  }

  if (!data.password) {
    fieldErrors.password = t('create.validation.passwordRequired');
  } else if (data.password.length < 6) {
    fieldErrors.password = t('create.validation.passwordMinLength');
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export function validateEditUser(data: EditUserForm, t: TFunction<'users'>) {
  const messages: string[] = [];

  if (!data.name?.trim()) {
    messages.push(t('edit.validation.nameRequired'));
  }

  if (!data.email?.trim()) {
    messages.push(t('edit.validation.emailRequired'));
  } else if (!emailRegex.test(data.email.trim())) {
    messages.push(t('edit.validation.emailInvalid'));
  }

  if (data.phone && data.phone.trim() && !phoneRegex.test(data.phone.trim())) {
    messages.push(t('edit.validation.phoneInvalid'));
  }

  return {
    valid: messages.length === 0,
    messages,
  };
}
