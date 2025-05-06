import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Create session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // Set cookie with secure options
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ 
      status: 'success',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Invalid or expired ID token' },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear session cookie
    cookies().delete('session');

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessionCookie = cookies().get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie);

    return NextResponse.json({
      status: 'success',
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    );
  }
} 