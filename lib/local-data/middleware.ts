import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "mi_session";

const disabledStorefrontRoutes = [
  "/account",
  "/cart",
  "/wishlist",
  "/order",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/shipping-returns",
  "/faq",
];

const disabledAdminRoutes = ["/admin/orders"];

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (
    disabledStorefrontRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`),
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/products";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (
    disabledAdminRoutes.some(
      (route) => path === route || path.startsWith(`${route}/`),
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", path);

  const isAdminRoute = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (isAdminRoute && !isAdminLogin && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}
