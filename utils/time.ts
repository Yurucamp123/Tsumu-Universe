/**
 * Get current time in Japan Standard Time (JST)
 */
export function getJapanTime(): Date {
  const now = new Date()
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))
}

/**
 * Get hour in JST (0-23)
 */
export function getJapanHour(): number {
  return getJapanTime().getHours()
}

/**
 * Determine if it's day or night in Japan
 * Day: 6:00 - 18:00 JST
 * Night: 18:00 - 6:00 JST
 */
export function isJapanDaytime(): boolean {
  const hour = getJapanHour()
  return hour >= 6 && hour < 18
}

/**
 * Get normalized time for smooth transitions (0-1)
 * Used for smooth color transitions
 */
export function getTimeNormalized(): number {
  const now = getJapanTime()
  const seconds = now.getSeconds()
  const milliseconds = now.getMilliseconds()
  return (seconds * 1000 + milliseconds) / 60000 // Cycles every minute
}
