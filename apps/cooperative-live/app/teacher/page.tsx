import Link from "next/link";

import { DemoTeacherConsole } from "@/components/DemoTeacherConsole";
import { LiveTeacherConsole } from "@/components/LiveTeacherConsole";
import { isLiveConfigured } from "@/lib/runtime";

export default function TeacherPage() {
  return (
    <main className="shell">
      <div className="topbar">
        <div>
          <Link className="back-link" href="/">← 처음으로</Link>
          <h1>교사 실시간 대시보드</h1>
          <p>개인 답을 수집하지 않고 모둠의 진행과 개입만 관리합니다.</p>
        </div>
      </div>
      {isLiveConfigured ? <LiveTeacherConsole /> : <DemoTeacherConsole />}
    </main>
  );
}
