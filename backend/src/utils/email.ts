// Simple email utility for user settings
// In a production environment, you would use a proper email service like SendGrid, Mailgun, etc.

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  // Placeholder implementation for development
  return Promise.resolve();
};
