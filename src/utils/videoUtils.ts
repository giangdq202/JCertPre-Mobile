import { DocumentDto } from "../services/documentService";

/**
 * Enhanced video detection utilities
 * Based on FE implementation and improved pattern matching
 */

export interface VideoDetectionStrategy {
  name: string;
  detect: (documents: DocumentDto[]) => DocumentDto | null;
}

/**
 * Multiple strategies for video detection
 */
export const videoDetectionStrategies: VideoDetectionStrategy[] = [
  // Strategy 1: Specific pattern matching (same as FE)
  {
    name: "Specific Pattern",
    detect: (docs) => docs.find((d) => d.fileUrl.includes("688ac2cc0012a1f4136d")) || null
  },
  
  // Strategy 2: File extension detection
  {
    name: "File Extension",
    detect: (docs) => docs.find((d) => 
      /\.(mp4|mov|m3u8|webm|avi|mkv)(\?|$)/i.test(d.fileUrl)
    ) || null
  },
  
  // Strategy 3: Video hosting services
  {
    name: "Video Services",
    detect: (docs) => docs.find((d) => 
      d.fileUrl.includes("youtube.com") || 
      d.fileUrl.includes("vimeo.com") ||
      (d.fileUrl.includes("googleapis.com") && d.fileUrl.includes("video"))
    ) || null
  },
  
  // Strategy 4: Document name contains video keywords
  {
    name: "Document Name",
    detect: (docs) => docs.find((d) => 
      d.documentName.toLowerCase().includes("video") ||
      d.documentName.toLowerCase().includes("bài giảng") ||
      d.documentName.toLowerCase().includes("lesson video")
    ) || null
  },
  
  // Strategy 5: Path-based detection
  {
    name: "Path Pattern",
    detect: (docs) => docs.find((d) => 
      /\/videos?\/|\/media\/video|\/content\/video/i.test(d.fileUrl)
    ) || null
  },
  
  // Strategy 6: Non-PDF documents (last resort)
  {
    name: "Non-PDF Fallback", 
    detect: (docs) => docs.find((d) => 
      d.fileUrl.includes("media") || 
      d.fileUrl.includes("content") ||
      !d.fileUrl.toLowerCase().includes(".pdf")
    ) || null
  }
];

/**
 * Enhanced video detection with multiple strategies
 * @param documents Array of documents to search
 * @returns Video document if found, null otherwise
 */
export const detectVideoDocument = (documents: DocumentDto[]): DocumentDto | null => {
  if (!documents || documents.length === 0) return null;
  
  // Try each strategy in order
  for (const strategy of videoDetectionStrategies) {
    const video = strategy.detect(documents);
    if (video) {
      console.log(`✅ Video found using strategy: ${strategy.name}`);
      console.log(`📹 Video: ${video.documentName} - ${video.fileUrl}`);
      return video;
    }
  }
  
  console.log("❌ No video found using any strategy");
  return null;
};

/**
 * Legacy video detection function (for backward compatibility)
 */
export const isVideoFile = (url?: string): boolean => {
  if (!url) return false;
  
  // Method 1: Check for specific video service patterns
  if (url.includes("688ac2cc0012a1f4136d")) return true;
  
  // Method 2: Check for common video hosting services
  if (url.includes("youtube.com") || url.includes("vimeo.com")) return true;
  if (url.includes("googleapis.com") && url.includes("video")) return true;
  
  // Method 3: Check file extensions
  if (/\.(mp4|mov|m3u8|webm|avi|mkv)(\?|$)/i.test(url)) return true;
  
  // Method 4: Check for video-like paths
  if (/\/videos?\/|\/media\/video/i.test(url)) return true;
  
  return false;
};

/**
 * Get debug information about video detection
 */
export const getVideoDetectionDebugInfo = (documents: DocumentDto[]) => {
  const results = videoDetectionStrategies.map(strategy => ({
    strategy: strategy.name,
    found: !!strategy.detect(documents),
    document: strategy.detect(documents)
  }));
  
  return {
    totalDocuments: documents.length,
    strategies: results,
    finalVideo: detectVideoDocument(documents)
  };
};
