import { NextResponse } from 'next/server';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullname =
      typeof body.fullname === 'string' ? body.fullname.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message =
      typeof body.message === 'string' ? body.message.trim() : '';

    if (!fullname || !EMAIL_PATTERN.test(email) || !message) {
      return NextResponse.json(
        { ok: false, error: 'Invalid contact form submission.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Malformed request payload.' },
      { status: 400 }
    );
  }
}
