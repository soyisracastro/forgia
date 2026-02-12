/**
 * RM Calculator using Epley and Brzycki formulas.
 * Standard in CrossFit/strength training for estimating maxes from submaximal lifts.
 */

/** Estimate 1RM from a weight × reps combination (average of Epley & Brzycki). */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;

  const epley = weight * (1 + reps / 30);
  const brzycki = weight * (36 / (37 - reps));

  return Math.round((epley + brzycki) / 2);
}

/** Generate a percentage table from a known 1RM. */
export function calculatePercentages(oneRM: number): { percent: number; weight: number }[] {
  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 50];

  return percentages.map((p) => ({
    percent: p,
    weight: Math.round(oneRM * (p / 100)),
  }));
}

/** Estimate the weight for a target rep count from a known 1RM (inverse Epley). */
export function estimateWeight(oneRM: number, targetReps: number): number {
  if (targetReps <= 0 || oneRM <= 0) return 0;
  if (targetReps === 1) return oneRM;

  // Inverse Epley: weight = 1RM / (1 + reps/30)
  return Math.round(oneRM / (1 + targetReps / 30));
}
