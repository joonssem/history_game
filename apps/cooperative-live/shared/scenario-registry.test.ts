import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getScenario,
  validateScenarioRegistry,
} from "../convex/scenarios.ts";

describe("서버 전용 협동 시나리오 레지스트리", () => {
  it("등록된 시나리오 계약과 3·4·5인 배치가 완전하다", () => {
    assert.deepEqual(validateScenarioRegistry(), []);
  });

  it("알 수 없는 ID와 버전을 최신판으로 바꾸지 않고 거부한다", () => {
    assert.equal(getScenario("unknown", 1), null);
    assert.equal(getScenario("early-goryeo-unity", 999), null);
  });

  it("고려 초기 3인 편성에는 빠진 발해 관점을 공통 자료로 보충한다", () => {
    const scenario = getScenario("early-goryeo-unity", 1);
    assert.ok(scenario);
    assert.equal(scenario.commonEvidenceByGroupSize[3].length > 0, true);
    assert.equal(scenario.commonEvidenceByGroupSize[4].length, 0);
  });

  it("조선 후기 3인 편성에는 빠진 수공업자 관점을 공통 자료로 보충한다", () => {
    const scenario = getScenario("joseon-late-market", 1);
    assert.ok(scenario);
    assert.equal(scenario.commonEvidenceByGroupSize[3].length, 1);
    assert.equal(scenario.commonEvidenceByGroupSize[3][0].id, "common-craftsman");
    assert.equal(scenario.commonEvidenceByGroupSize[4].length, 0);
    assert.equal(scenario.commonEvidenceByGroupSize[5].length, 0);
  });

  it("고려 문화 활동은 빠진 인쇄 기술 관점을 공통 자료로 보충하고 출처를 갖춘다", () => {
    const scenario = getScenario("goryeo-culture-life", 1);
    assert.ok(scenario);
    assert.equal(scenario.roles.length, 5);
    assert.equal(scenario.commonEvidenceByGroupSize[3][0].id, "common-jikji");
    assert.equal(scenario.commonEvidenceByGroupSize[4].length, 0);
    assert.equal(scenario.commonEvidenceByGroupSize[5].length, 0);
    assert.equal(scenario.sources.length, 4);
    assert.ok(scenario.roles.some((role) => role.id === "family-record-reader"));
    assert.ok(scenario.sharedPrompt.limitations.length >= 2);
  });
});
