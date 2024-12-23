function timeUntilSunday11pmUTC(): string {
  const now = new Date();

  // Calculate days until next Sunday
  const daysUntilSunday = (7 - now.getUTCDay()) % 7; // Days left until next Sunday
  const targetDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilSunday,
    23, 0, 0, 0 // Set time to 11:00 PM UTC
  ));

  // If it's already past 11 PM UTC on Sunday, calculate for the following Sunday
  if (now > targetDate) {
    targetDate.setUTCDate(targetDate.getUTCDate() + 7);
  }

  const diffMs = targetDate.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours} hours and ${minutes} minutes`;
}

export default timeUntilSunday11pmUTC;
