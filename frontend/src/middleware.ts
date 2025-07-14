import { NextResponse, type NextRequest } from "next/server";
import { AuthApi } from "@/services";

export const config = {
  matcher: ["/dashboard/:path*", "/"], 
};
export async function middleware(req: NextRequest) {
  const access = req.cookies.get("access_token")?.value;
  const refresh = req.cookies.get("refresh_token")?.value;

  if (req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/main";
    return NextResponse.redirect(url);
  }

  if (access) {
    return NextResponse.next();
  }

  
  if (refresh) {
    try {
      await AuthApi.refreshToken();
      return NextResponse.next();
    } catch {

    }
  }
  
  return NextResponse.redirect(new URL("/auth/login", req.url));
}