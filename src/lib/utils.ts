/**
 * Attempts to extract the first URL from a string that might be
 * a JSON array containing a single URL string (e.g., '["http://example.com"]' ).
 * 
 * @param urlString The potential URL string or stringified array.
 * @returns The extracted URL string, or null if extraction fails or input is invalid.
 */
export function extractUrlFromStringArray(urlString: string | null | undefined): string | null {
  if (!urlString || typeof urlString !== 'string') {
    return null;
  }

  const trimmed = urlString.trim();

  // Basic check if it looks like a stringified array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      // Check if it parsed to an array and the first item is a string
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
        return parsed[0];
      }
    } catch (e) {
      // Ignore JSON parsing errors, it might just be a string with brackets
      console.warn('Failed to parse potential JSON array string:', urlString, e);
    }
  }
  
  // If it doesn't look like an array or parsing failed, 
  // return null assuming it wasn't the expected format.
  // Alternatively, you could return the original `trimmed` string if 
  // sometimes the URL is stored correctly *without* brackets/quotes.
  // Returning null is safer if you expect ONLY the array format or null.
  return null; 
} 