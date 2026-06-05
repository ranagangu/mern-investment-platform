export function toUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function startOfUtcDay(date = new Date()) {
  const key = toUtcDateKey(date);
  return new Date(`${key}T00:00:00.000Z`);
}
