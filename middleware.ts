import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // ─── PUBLIC PAGES: /login, /signup, /admin/login ───
  // NEVER redirect away from these. Users must always be able
  // to reach login/signup pages, even if a stale cookie exists.
  // The login page itself handles role checks after a fresh login.
  if (pathname === '/login' || pathname === '/signup' || pathname === '/admin/login') {
    return NextResponse.next()
  }

  // ─── PROTECTED: /volunteers/* ───
  if (pathname.startsWith('/volunteers')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      if (payload.role !== 'VOLUNTEER') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ─── PROTECTED: /admin/* (except /admin/login handled above) ───
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)

      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/volunteers/:path*', '/admin/:path*', '/login', '/signup']
}