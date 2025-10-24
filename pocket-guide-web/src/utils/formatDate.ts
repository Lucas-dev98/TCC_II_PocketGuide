/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date to a readable string
 * @param date Date to format
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted date string
 */
export const formatDate = (date: Date, locale: string = "en-US"): string => {
  return date.toLocaleDateString(locale, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format a time string
 * @param timeString Time in HH:mm format
 * @returns Formatted time
 */
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

/**
 * Calculate the difference between two dates in days
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days
 */
export const daysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
};

/**
 * Get day name from a date
 * @param date Date to get day name for
 * @returns Day name
 */
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

/**
 * Add days to a date
 * @param date Base date
 * @param days Number of days to add
 * @returns New date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
