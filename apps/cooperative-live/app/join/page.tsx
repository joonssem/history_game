import Link from "next/link";
import { Suspense } from "react";

import { LiveJoinForm } from "@/components/LiveJoinForm";
import { isLiveConfigured } from "@/lib/runtime";

export default function JoinPage() {
  return (
    <main className="shell">
      <section className="student-panel">
        <Link className="back-link" href="/">← 처음으로</Link>
        <h1>협동 MUD 입장</h1>
        <p>이름·학번·이메일은 입력하지 않습니다. 활동마다 새로운 호를 고릅니다.</p>
        {isLiveConfigured ? (
          <Suspense fallback={<div className="notice">입장 화면을 준비하고 있습니다.</div>}>
            <LiveJoinForm />
          </Suspense>
        ) : (
          <div className="mode-banner">
            지금은 가상 데이터 모드입니다. 교사 대시보드에서 학생 8명 입장과 무작위
            편성을 확인해 주세요.
          </div>
        )}
      </section>
    </main>
  );
}
