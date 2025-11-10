/**
 * PocketBase Client
 *
 * Singleton PocketBase instance for Next.js App Router
 */

import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://theyworkforcitizen-api.duckdns.org';

let pb: PocketBase | null = null;

/**
 * Get PocketBase instance (Singleton)
 */
export function getPocketBase(): PocketBase {
  if (!pb) {
    pb = new PocketBase(POCKETBASE_URL);

    // Disable auto-cancellation (for parallel requests)
    pb.autoCancellation(false);

    // Optional: Enable debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[PocketBase] Client initialized:', POCKETBASE_URL);
    }
  }

  return pb;
}

/**
 * Default export for convenience
 */
export const pocketbase = getPocketBase();

/**
 * Get file URL from PocketBase
 *
 * @param record - The record containing the file
 * @param filename - The filename from the file field
 * @param thumb - Optional thumbnail size (e.g., '100x100')
 * @returns Full URL to the file
 */
export function getFileUrl(
  collectionId: string,
  recordId: string,
  filename: string,
  thumb?: string
): string {
  const pb = getPocketBase();
  const url = pb.files.getUrl({ collectionId, id: recordId } as any, filename, { thumb });
  return url;
}

/**
 * Type-safe file URL getter for councillors
 */
export function getCouncillorPhotoUrl(recordId: string, filename: string): string {
  return getFileUrl('councillors', recordId, filename, '300x300');
}
