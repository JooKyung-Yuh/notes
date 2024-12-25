import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isGuest = token?.isGuest
    const isAdmin = token?.isAdmin
    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register')
    const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
    const isHomePage = req.nextUrl.pathname === '/'

    // 디버깅용 로그
    // console.log('Middleware check:', {
    //   token,
    //   isAuth,
    //   isGuest,
    //   isAdmin,
    //   path: req.nextUrl.pathname,
    // })

    // Admin 페이지 접근 처리
    if (isAdminPage) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return null
    }

    // 홈페이지 처리
    if (isHomePage) {
      if (isAuth) {
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 인증 페이지 처리
    if (isAuthPage) {
      if (isAuth && !isGuest) {
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return null
    }

    // 인증되지 않은 사용자 처리
    if (!isAuth) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
  },
)

export const config = {
  matcher: ['/', '/dashboard/:path*', '/admin/:path*', '/login', '/register'],
}
