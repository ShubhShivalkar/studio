
'use server';

import { WaitlistUser } from './user-service';
import nodemailer from "nodemailer";

/**
 * Sends a confirmation email to a user who has joined the waitlist.
 * 
 * @param user The waitlist user data.
 */
// export async function sendWaitlistConfirmationEmail(user: WaitlistUser): Promise<void> {
//   // TODO: Replace this with a real email sending implementation (e.g., using Resend, SendGrid, or AWS SES).
//   console.log(`
//     --- Sending Waitlist Confirmation Email ---
//     To: ${user.email}
//     Subject: You're on the anuvaad inner circle waitlist!
    
//     Hi ${user.name},
    
//     Thank you for joining the waitlist for anuvaad's inner circle. We're excited to have you!
    
//     We'll be in touch soon with more updates.
    
//     Best,
//     The anuvaad Team
//     ----------------------------------------
//   `);

//   // Simulate a network delay for sending email
//   await new Promise(resolve => setTimeout(resolve, 500));
// }

export async function sendWaitlistConfirmationEmail(user: WaitlistUser) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use "smtp.ethereal.email" for testing
    auth: {
      user: "info@igamingcompass.com",
      pass: "orthqvfnjsdazljw", // app password, not your raw Gmail password
    },
  });

  await transporter.sendMail({
    from: `"My App Team" <${"info@igamingcompass.com"}>`,
    to: user.email,
    subject: "You're on the waitlist 🎉",
    text: `Hi ${user.name},\n\nThanks for joining our waitlist! We'll keep you posted.\n\nCheers,\nTeam`,
    html: `<p>Hi <b>${user.name}</b>,</p>
           <p>Thanks for joining our waitlist! We'll keep you posted.</p>
           <p>Cheers,<br/>Team</p>`,
  });
}
