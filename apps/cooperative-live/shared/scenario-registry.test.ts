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

  it("고려 주변 나라 관계 3인 편성에는 빠진 마을 사람 관점을 공통 자료로 보충한다", () => {
    const scenario = getScenario("goryeo-foreign-relations", 1);
    assert.ok(scenario);
    assert.equal(scenario.commonEvidenceByGroupSize[3].length, 1);
    assert.equal(scenario.commonEvidenceByGroupSize[3][0].id, "common-villager");
    assert.equal(scenario.commonEvidenceByGroupSize[4].length, 0);
    assert.equal(scenario.commonEvidenceByGroupSize[5].length, 0);
  });

  it("고려 주변 나라 관계 역할 근거는 시기를 표시하고 역할마다 고유하다", () => {
    const scenario = getScenario("goryeo-foreign-relations", 1);
    assert.ok(scenario);
    const ids = scenario.roles.flatMap((role) => role.evidence.map((item) => item.id));
    assert.equal(new Set(ids).size, ids.length);
    for (const role of scenario.roles) {
      for (const item of role.evidence) {
        assert.match(item.label, /^\[(거란 시기|몽골 시기|두 시기 비교)\]/);
      }
    }
    assert.ok(scenario.sources.length >= 6);
  });
});

describe("Goryeo culture evidence scope", () => {
  it("keeps life evidence mandatory and excludes unverified claims", () => {
    const scenario = getScenario("goryeo-culture-life", 1);
    assert.ok(scenario);
    assert.deepEqual(scenario.draftRequirements, {
      policyIds: ["family-life"],
      evidenceRoleIds: ["family-record-reader"],
      connectionIds: ["record-and-scope"],
    });
    assert.equal(scenario.commonEvidenceByGroupSize[3][0]?.id, "common-jikji");
    assert.equal(scenario.roles.some((role) => role.evidence.some((item) => item.id === "tripitaka-labor")), true);
    const content = JSON.stringify(scenario);
    for (const excluded of ["벽란도", "선원사", "분사도감", "1398", "1995", "2007"]) {
      assert.equal(content.includes(excluded), false, `unexpected claim: ${excluded}`);
    }
  });
});
