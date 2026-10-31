import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { contactService } from '@/services/contact-service';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = await contactService.submitContactMessage(body);

    return NextResponse.json(
      {
        ok: true,
        persisted: result.persisted,
        id: result.message.id,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            error.issues[0]?.message ?? 'Invalid contact form submission.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Malformed request payload.' },
      { status: 400 }
    );
  }
}
