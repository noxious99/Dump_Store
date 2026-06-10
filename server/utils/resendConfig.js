const { Resend } = require('resend');

// Lazy init: the Resend constructor throws on a missing key, which would
// crash the server at require() time.
let resend;
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Email service is not configured (RESEND_API_KEY missing)');
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const sendResetEmail = async (toEmail, resetUrl) => {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: 'noreply@tracero.me',
      to: [toEmail],
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
          <p>Thanks,<br>Team Tracero</p>
        </div>
      `
    });

    if (result.error) {
      console.log('Failed to send password reset email:', result.error);
      throw new Error(result.error.message || 'Failed to send email');
    }
    return { success: true, id: result.data?.id || null };
  } catch (error) {
    throw new Error(error.message || 'Failed to send email');
  }
};

module.exports = sendResetEmail;