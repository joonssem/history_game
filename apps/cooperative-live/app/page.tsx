import Link from "next/link";

import { SCENARIO_TITLE } from "@/shared/scenario";

export default function HomePage() {
  return (
    <main className="shell landing">
      <section className="hero">
        <p className="eyebrow">10분 이내 · 활동마다 새 호 · 기록 이어짐 없음</p>
        <h1>친구들과 함께 결정하는 역사 이야기</h1>
        <p>
          서로 다른 역할의 자료를 말로 나누고, 모둠의 판단을 만들어 보세요. 이번
          수직 슬라이스는 <strong>{SCENARIO_TITLE}</strong>을 사용합니다.
        </p>
      </section>
      <section className="entry-grid" aria-label="접속 방법">
        <article className="entry-card student-card">
          <span className="entry-icon" aria-hidden="true">🧭</span>
          <h2>학생으로 입장</h2>
          <p>교실 화면의 QR을 찍거나 여섯 자리 수업 코드를 입력합니다.</p>
          <Link className="primary-link" href="/join">수업 코드 입력</Link>
        </article>
        <article className="entry-card teacher-card">
          <span className="entry-icon" aria-hidden="true">🏫</span>
          <h2>교사 대시보드</h2>
          <p>모둠 구성과 진행 상태를 보고 힌트 또는 심화 상황을 보냅니다.</p>
          <Link className="secondary-link" href="/teacher">교사 화면 열기</Link>
        </article>
      </section>
    </main>
  );
}
