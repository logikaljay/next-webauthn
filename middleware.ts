import { NextResponse, NextRequest } from 'next/server';

const cookieName = process.env.COOKIE_NAME ?? 'app-session'

export function middleware(request: NextRequest) {

  // Store current request url in a custom header, which you can read later
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);

  let response = NextResponse.next({
    request: {
      // Apply new request headers
      headers: requestHeaders,
    }
  });

  if (!request.cookies.get(cookieName)) {
    response.cookies.set({
      name: cookieName,
      value: crypto.randomUUID(),
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 86_400
    })
  }

  return response
}
