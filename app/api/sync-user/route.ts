import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Clerk 사용자를 Supabase users 테이블에 동기화하는 API
 *
 * 클라이언트에서 로그인 후 이 API를 호출하여 사용자 정보를 Supabase에 저장합니다.
 * 이미 존재하는 경우 업데이트하고, 없으면 새로 생성합니다.
 */
export async function POST() {
  try {
    console.group('[Sync User API] 사용자 동기화 시도');
    
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      console.log('[Sync User API] 인증되지 않은 사용자');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('[Sync User API] Clerk 사용자 ID:', userId);

    // Clerk에서 사용자 정보 가져오기
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      console.error('[Sync User API] Clerk 사용자를 찾을 수 없음');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('[Sync User API] Clerk 사용자 정보:', {
      id: clerkUser.id,
      name: clerkUser.fullName || clerkUser.username || 'Unknown',
    });

    // Supabase 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[Sync User API] Supabase 환경 변수 누락:', {
        hasUrl: !!supabaseUrl,
        hasServiceRoleKey: !!supabaseServiceRoleKey,
      });
      return NextResponse.json(
        { 
          error: "Supabase configuration missing",
          details: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set"
        },
        { status: 500 }
      );
    }

    // Supabase에 사용자 정보 동기화
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          clerk_id: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.username ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "Unknown",
        },
        {
          onConflict: "clerk_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[Sync User API] Supabase 동기화 오류:', error);
      return NextResponse.json(
        { error: "Failed to sync user", details: error.message },
        { status: 500 }
      );
    }

    console.log('[Sync User API] 사용자 동기화 성공:', data);
    console.groupEnd();
    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error('[Sync User API] 예상치 못한 오류:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
