/**
 * Converts Google Drive share links to direct view URLs
 * Supports formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * 
 * @param url - The URL to convert
 * @returns Direct view URL or original URL if not a Google Drive link
 */
export const getDirectUrl = (url: string): string => {
    if (!url) return url;

    // Handle Google Drive links
    if (url.includes('drive.google.com')) {
        // Extract file ID
        let fileId = '';
        const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);

        if (match1) fileId = match1[1];
        else if (match2) fileId = match2[1];

        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
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
