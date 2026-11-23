// SM-2 Scheduling Module
export function createInitialProblem({ title, url = "", topic = "", difficulty = "Easy" }) {
  return {
    id: crypto.randomUUID(),
    title,
    url,
    topic,
    difficulty,
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    lastReviewedAt: null,
    nextReviewAt: Date.now() + 24 * 60 * 60 * 1000,
  };
}

export function applySM2(problem, quality) {
  // quality: 1 = Hard, 3 = Good, 5 = Easy
  if (quality < 3) {
    problem.repetition = 0;
    problem.interval = 1;
  } else if (problem.repetition === 0) {
    problem.interval = 1;
    problem.repetition = 1;
  } else if (problem.repetition === 1) {
    problem.interval = 6;
    problem.repetition = 2;
  } else {
    problem.interval = Math.round(problem.interval * problem.easeFactor);
    problem.repetition += 1;
  }
  const efChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  problem.easeFactor = Math.max(
    1.3,
    Number((problem.easeFactor + efChange).toFixed(2))
  );
  problem.lastReviewedAt = Date.now();
  problem.nextReviewAt = Date.now() + problem.interval * 86400000;
  return problem;
}

export function isDue(problem, now = Date.now()) {
  return now >= problem.nextReviewAt;
}
