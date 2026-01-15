/* eslint-disable max-lines-per-function */
/**
 * Estonian Isikukood (Personal Identification Code) validation utility
 * Format: GYYMMDDSSSC
 * G - gender and century (1-6)
 * YYMMDD - date of birth
 * SSS - serial number
 * C - checksum
 */

export function validateIsikukood(code: string): boolean {
  // Must be exactly 11 digits
  if (!code || !/^\d{11}$/.test(code)) {
    return false;
  }

  const digits = code.split('').map(Number);
  
  // Validate century/gender digit (1-6)
  const centuryGender = digits[0];
  if (centuryGender === undefined || centuryGender < 1 || centuryGender > 6) {
    return false;
  }

  // Extract and validate date components
  const month = parseInt(code.substring(3, 5));
  const day = parseInt(code.substring(5, 7));

  // Validate month (01-12)
  if (month < 1 || month > 12) {
    return false;
  }

  // Validate day (01-31, roughly - not doing full date validation)
  if (day < 1 || day > 31) {
    return false;
  }

  // Calculate and verify checksum
  const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
  const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += (digits[i] ?? 0) * (weights1[i] ?? 0);
  }
  
  let checksum = sum % 11;
  
  // If remainder is 10, use second weight sequence
  if (checksum === 10) {
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += (digits[i] ?? 0) * (weights2[i] ?? 0);
    }
    checksum = sum % 11;
    
    // If still 10, checksum should be 0
    if (checksum === 10) {
      checksum = 0;
    }
  }
  
  return checksum === (digits[10] ?? -1);
}

export function getNameFromIsikukood(code: string): string {
  // Returns a generated Estonian name based on the code
  // For demo purposes only
  const firstNames = {
    male: ['Mart', 'Jaan', 'Toomas', 'Andres', 'Priit', 'Raivo', 'Jaak', 'Tarmo'],
    female: ['Mari', 'Liina', 'Kadri', 'Piret', 'Kersti', 'Tiina', 'Kristiina', 'Maarja']
  };
  
  const lastNames = ['Tamm', 'Sepp', 'Saar', 'Mägi', 'Kukk', 'Rebane', 'Ilves', 'Kask'];
  
  if (!validateIsikukood(code)) {
    return 'Unknown User';
  }
  
  const genderDigit = parseInt(code[0] ?? '0');
  const isMale = genderDigit % 2 === 1;
  const nameIndex = parseInt(code.substring(7, 9)) % 8;
  const surnameIndex = parseInt(code.substring(9, 11)) % 8;
  
  const firstName = isMale ? firstNames.male[nameIndex] : firstNames.female[nameIndex];
  const lastName = lastNames[surnameIndex];
  
  return `${firstName} ${lastName}`;
}

export function formatIsikukood(code: string): string {
  // Format for display: XXX XX XX XXX X
  if (!code || code.length !== 11) return code;
  return `${code.slice(0, 3)} ${code.slice(3, 5)} ${code.slice(5, 7)} ${code.slice(7, 10)} ${code.slice(10)}`;
}