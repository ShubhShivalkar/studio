
import { NextResponse } from 'next/server';
import { addToWaitlist, WaitlistUser } from '@/services/user-service';
import { sendWaitlistConfirmationEmail } from '@/services/email-service';

export async function POST(request: Request) {
  try {
    const body: WaitlistUser = await request.json();

    if (!body.name || !body.email || !body.dob) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const waitlistId = await addToWaitlist(body);

    // Fire-and-forget email sending
    sendWaitlistConfirmationEmail(body).catch(err => {
        console.error("Failed to send waitlist confirmation email:", err);
    });

    return NextResponse.json({ message: 'Successfully added to waitlist', id: waitlistId }, { status: 201 });
  } catch (error) {
    console.error('Waitlist API Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ message: `Error adding to waitlist: ${message}` }, { status: 500 });
  }
}
