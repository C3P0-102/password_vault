export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeLookAlikes: boolean;
}

const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Characters that look similar and can cause confusion
const LOOK_ALIKES = 'il1Lo0O';

export const generatePassword = (options: PasswordOptions): string => {
  let charset = '';

  // Build character set based on options
  if (options.includeLowercase) {
    charset += options.excludeLookAlikes
      ? LOWERCASE_CHARS.replace(/[il]/g, '')
      : LOWERCASE_CHARS;
  }

  if (options.includeUppercase) {
    charset += options.excludeLookAlikes
      ? UPPERCASE_CHARS.replace(/[LO]/g, '')
      : UPPERCASE_CHARS;
  }

  if (options.includeNumbers) {
    charset += options.excludeLookAlikes
      ? NUMBER_CHARS.replace(/[10]/g, '')
      : NUMBER_CHARS;
  }

  if (options.includeSymbols) {
    charset += SYMBOL_CHARS;
  }

  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  let password = '';

  // Ensure password contains at least one character from each selected type
  const guaranteedChars = [];

  if (options.includeLowercase) {
    const chars = options.excludeLookAlikes
      ? LOWERCASE_CHARS.replace(/[il]/g, '')
      : LOWERCASE_CHARS;
    guaranteedChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (options.includeUppercase) {
    const chars = options.excludeLookAlikes
      ? UPPERCASE_CHARS.replace(/[LO]/g, '')
      : UPPERCASE_CHARS;
    guaranteedChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (options.includeNumbers) {
    const chars = options.excludeLookAlikes
      ? NUMBER_CHARS.replace(/[10]/g, '')
      : NUMBER_CHARS;
    guaranteedChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (options.includeSymbols) {
    guaranteedChars.push(SYMBOL_CHARS[Math.floor(Math.random() * SYMBOL_CHARS.length)]);
  }

  // Fill remaining length with random characters
  for (let i = guaranteedChars.length; i < options.length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Add guaranteed characters
  password += guaranteedChars.join('');

  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};
