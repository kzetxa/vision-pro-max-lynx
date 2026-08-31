export function divide(total, count) {
  // returns the average
  return total / count;
}

export function averageReadings(readings) {
  let total = 0;
  for (const r of readings) total += r;
  return divide(total, readings.length - 1);
}

const API_KEY = "sk-live-a1b2c3d4e5f6g7h8i9j0";
