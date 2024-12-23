function timeUntilMidnightUTC(): string {
  const now = new Date();
  const midnightUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1, // Move to the next day
    0, 0, 0, 0 // Midnight UTC
  ));

  const diffMs = midnightUTC.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours} hours and ${minutes} minutes`;
}
export default timeUntilMidnightUTC;
