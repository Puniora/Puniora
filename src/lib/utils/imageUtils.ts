/**
 * Converts Google Drive share links to direct view URLs
 * Supports formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID (already direct)
 * - https://drive.google.com/thumbnail?id=FILE_ID&sz=w4000 (already direct)
 * 
 * @param url - The URL to convert
 * @returns Direct view URL or original URL if not a Google Drive link
 */
export const getDirectUrl = (url: string, width: number = 800): string => {
    if (!url) return url;

    // Handle Google Drive links
    if (url.includes('drive.google.com')) {
        // If already a direct URL (uc?export or thumbnail), return as-is
        // Note: If it's a thumbnail link, we could technically replace the sz param, but let's respect provided explicit links for now unless we parsing them too.
        if (url.includes('/uc?') || url.includes('/thumbnail?')) {
            return url;
        }

        // Extract file ID from various formats
        let fileId = '';

        // Format: /file/d/FILE_ID/view or /file/d/FILE_ID/edit
        const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        // Format: /open?id=FILE_ID
        const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        // Format: /d/FILE_ID (short format)
        const match3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);

        if (match1) fileId = match1[1];
        else if (match2) fileId = match2[1];
        else if (match3) fileId = match3[1];

        if (fileId) {
            // Use thumbnail API for better performance and reliability
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
        }
    }

    return url;
};

/**
 * Processes an array of image URLs, converting Google Drive links
 * @param urls - Array of image URLs
 * @returns Array of processed URLs
 */
export const processImageUrls = (urls: string[]): string[] => {
    return urls.map(url => getDirectUrl(url));
};
