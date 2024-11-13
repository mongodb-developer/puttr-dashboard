// src/utils/screenshotUtil.ts

interface CustomDisplayMediaOptions {
    video?: {
      displaySurface?: 'browser' | 'window' | 'monitor' | 'application';
      logicalSurface?: boolean;
      // Define other supported properties
      width?: number;
      height?: number;
      frameRate?: number;
    };
    audio?: boolean;
  }
  
  export async function captureElement(): Promise<string> {
    try {
      // Use the correct type for the options
      const displayMediaOptions: CustomDisplayMediaOptions = {
        video: {
          displaySurface: "window",
        },
        audio: false
      };
  
      // Request screen capture permission and stream
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      
      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Wait for video metadata to load
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
  
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/png');
      
      // Cleanup
      video.remove();
      canvas.remove();
      
      return imageData;
      
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Screen capture permission denied');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Screen capture is not supported in this browser');
        }
      }
      throw new Error('Failed to capture screenshot');
    }
  }
  
  // Add type checking for browser support
  export function isScreenCaptureSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia
    );
  }