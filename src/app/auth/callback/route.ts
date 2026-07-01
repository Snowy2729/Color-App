import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Başarılı olursa veya hata olsa bile dashboard'a veya giriş sayfasına yönlendir
  // Hata durumunda supabase session olmadığı için layout otomatik login'e atacaktır.
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
