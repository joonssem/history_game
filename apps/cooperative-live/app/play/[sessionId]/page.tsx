"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { LiveStudentActivity } from "@/components/LiveStudentActivity";
import { isLiveConfigured } from "@/lib/runtime";

export default function StudentPlayPage() {
  const params = useParams<{ sessionId: string }>();

  return (
    <main className="shell">
      {isLiveConfigured ? (
        <LiveStudentActivity sessionId={params.sessionId} />
      ) : (
        <section className="student-panel">
          <Link className="back-link" href="/teacher">← 교사 가상 대시보드</Link>
          <h1>가상 학생 화면</h1>
          <p>Convex 개발 배포를 연결하면 이 주소에서 학생별 실시간 화면을 확인할 수 있습니다.</p>
        </section>
      )}
    </main>
  );
}
