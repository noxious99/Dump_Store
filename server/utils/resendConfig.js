const {Resend} = require('resend');

const resend = new Resend('*******');

const sendResetEmail = async (to, resetToken, resetUrl) => {
  try {
    const resetLink = `${resetUrl}/reset-password?token=${resetToken}`;
    
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['hamim.c.7@gmail.com'],
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
          <p>Thanks,<br>The DumpStore Team</p>
        </div>
      `
    });
    
    console.log('Password reset email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

module.exports = sendResetEmail;