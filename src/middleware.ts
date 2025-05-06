import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Auth } from 'firebase-admin/auth';
import { auth } from '@/lib/firebase/admin';

// Add paths that require authentication
const protectedPaths = ['/manomedai', '/dashboard', '/questionnaire', '/profile'];

// Add paths that should redirect to dashboard if already authenticated
const authRedirectPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthRedirectPath = authRedirectPaths.some(path => pathname.startsWith(path));

  // Get the Firebase session cookie
  const sessionCookie = request.cookies.get('session')?.value;
  
  if (sessionCookie && auth) {
    try {
      // Verify the session cookie
      await (auth as Auth).verifySessionCookie(sessionCookie);
      
      // If user is authenticated and trying to access auth pages, redirect to dashboard
      if (isAuthRedirectPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // Allow access to protected routes
      return NextResponse.next();
    } catch (error) {
      // If session is invalid, clear the cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // If trying to access protected route without auth, redirect to login
  if (isProtectedPath) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 