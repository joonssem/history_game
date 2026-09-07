import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ALIASES,
  assignGroups,
  nextStudentStage,
  planGroupSizes,
  pickUniqueAliases,
  seededRandom,
} from "./scenario.ts";

describe("고조선 첫 수직 슬라이스 편성", () => {
  it("가상 학생 8명을 중복 없이 4명씩 두 모둠에 배정한다", () => {
    const participants = Array.from({ length: 8 }, (_, index) => `fake-${index + 1}`);
    const assignments = assignGroups(participants, 4, seededRandom(20260907));

    assert.equal(assignments.length, 8);
    assert.equal(new Set(assignments.map((item) => item.participantKey)).size, 8);
    assert.equal(assignments.filter((item) => item.groupNumber === 1).length, 4);
    assert.equal(assignments.filter((item) => item.groupNumber === 2).length, 4);
    assert.equal(
      new Set(
        assignments
          .filter((item) => item.groupNumber === 1)
          .map((item) => item.roleId),
      ).size,
      4,
    );
  });

  it("활동마다 사용할 서로 다른 호 8개를 만든다", () => {
    const aliases = pickUniqueAliases(8, seededRandom(17));

    assert.equal(aliases.length, 8);
    assert.equal(new Set(aliases).size, 8);
    assert.equal(
      aliases.every((alias) => ALIASES.includes(alias as (typeof ALIASES)[number])),
      true,
    );
  });

  it("3명부터 24명까지 3~5명 모둠으로 균형 있게 편성한다", () => {
    for (let count = 3; count <= ALIASES.length; count += 1) {
      const participants = Array.from({ length: count }, (_, index) => `student-${index + 1}`);
      const assignments = assignGroups(participants, 4, seededRandom(count));
      const sizes = planGroupSizes(count, 4);

      assert.equal(assignments.length, count);
      assert.equal(
        new Set(assignments.map((item) => item.participantKey)).size,
        count,
      );
      assert.deepEqual(
        sizes,
        [...new Set(assignments.map((item) => item.groupNumber))].map(
          (groupNumber) => assignments.filter((item) => item.groupNumber === groupNumber).length,
        ),
      );
      assert.equal(sizes.every((size) => size >= 3 && size <= 5), true);
      for (const groupNumber of new Set(assignments.map((item) => item.groupNumber))) {
        const roles = assignments
          .filter((item) => item.groupNumber === groupNumber)
          .map((item) => item.roleId);
        assert.equal(new Set(roles).size, roles.length);
      }
    }
  });

  it("학생이 1~2명이면 모둠을 만들지 않는다", () => {
    assert.throws(() => assignGroups(["one"]));
    assert.throws(() => assignGroups(["one", "two"]));
  });

  it("학생 단계는 정해진 순서로만 앞으로 간다", () => {
    assert.equal(nextStudentStage("role"), "first");
    assert.equal(nextStudentStage("history"), "finished");
    assert.equal(nextStudentStage("finished"), "finished");
  });
});
