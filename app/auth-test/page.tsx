import { AuthTestClient } from "./auth-test-client";

// 동적 렌더링 강제 (클라이언트 컴포넌트 사용)
export const dynamic = 'force-dynamic';

export default function AuthTestPage() {
  return <AuthTestClient />;
}
