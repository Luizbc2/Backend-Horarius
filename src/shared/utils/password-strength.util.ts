export const validatePasswordStrength = (value: string): string | null => {
  if (value.trim().length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!/[a-z]/.test(value)) {
    return "Password must include at least one lowercase letter.";
  }

  if (!/\d/.test(value)) {
    return "Password must include at least one number.";
  }

  return null;
};
