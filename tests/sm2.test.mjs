import test from "node:test";
import assert from "node:assert/strict";
import { applySM2, createInitialProblem, isDue } from "../sm2.js";

test("createInitialProblem initializes SM-2 defaults and schedules +24h", () => {
  const before = Date.now();
  const p = createInitialProblem({
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    topic: "Arrays",
    difficulty: "Easy",
  });
  assert.ok(p.id);
  assert.equal(p.title, "Two Sum");
  assert.equal(p.repetition, 0);
  assert.equal(p.interval, 0);
  assert.equal(p.easeFactor, 2.5);
  assert.equal(p.lastReviewedAt, null);
  assert.ok(p.nextReviewAt >= before + 24 * 60 * 60 * 1000 - 100);
});

test("applySM2 follows standard 1d -> 6d -> EF*interval progression for Good (3)", () => {
  const p = createInitialProblem({ title: "LRU Cache" });

  applySM2(p, 3);
  assert.equal(p.repetition, 1);
  assert.equal(p.interval, 1);

  applySM2(p, 3);
  assert.equal(p.repetition, 2);
  assert.equal(p.interval, 6);

  const efBeforeThird = p.easeFactor;
  applySM2(p, 3);
  assert.equal(p.repetition, 3);
  assert.equal(p.interval, Math.round(6 * efBeforeThird));
});

test("applySM2 resets repetition and interval to 1 day on Hard (< 3)", () => {
  const p = createInitialProblem({ title: "Word Ladder" });
  applySM2(p, 5);
  applySM2(p, 5);
  assert.equal(p.repetition, 2);
  assert.equal(p.interval, 6);

  applySM2(p, 1);
  assert.equal(p.repetition, 0);
  assert.equal(p.interval, 1);
  assert.ok(p.easeFactor >= 1.3);
});

test("applySM2 enforces minimum easeFactor floor of 1.3", () => {
  const p = createInitialProblem({ title: "Median of Two Sorted Arrays" });
  for (let i = 0; i < 15; i += 1) {
    applySM2(p, 1);
  }
  assert.equal(p.easeFactor, 1.3);
});

test("isDue checks nextReviewAt boundary accurately", () => {
  const p = createInitialProblem({ title: "Merge Intervals" });
  p.nextReviewAt = 10_000;
  assert.equal(isDue(p, 9_999), false);
  assert.equal(isDue(p, 10_000), true);
  assert.equal(isDue(p, 10_001), true);
});
