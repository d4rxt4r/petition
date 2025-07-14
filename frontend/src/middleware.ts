import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
    /* ---------- корневой / → сразу на /app ---------- */
    if (req.nextUrl.pathname === '/') {
        const url = req.nextUrl.clone();
        url.pathname = '/main';
        return NextResponse.redirect(url);
    }
}
