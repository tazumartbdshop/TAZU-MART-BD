import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// Helper to add timeout to promise
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms))
  ]);
};

export const resizeImage = (file: File, maxWidth: number = 800): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        if (img.width > maxWidth) {
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Canvas to Blob failed');
        }, 'image/jpeg', 0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const blobToBase64 = (blob: Blob | File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const uploadImage = async (file: File | Blob, folder: string, originalName?: string): Promise<string> => {
  const extension = originalName?.split('.').pop() || 'jpg';
  const cleanName = originalName ? originalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) : `img-${Date.now()}`;
  const fileName = `${Date.now()}-${cleanName}.${extension}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  console.log(`Starting upload to: ${folder}/${fileName}`);
  
  try {
    // Attempt upload to Firebase Storage with a strict 3.5 second timeout
    const snapshot = await withTimeout(
      uploadBytes(storageRef, file),
      3500,
      "Firebase Storage upload timed out"
    );
    console.log(`Upload complete. Snapshot:`, snapshot);
    
    const downloadURL = await withTimeout(
      getDownloadURL(storageRef),
      3500,
      "Firebase Storage URL retrieval timed out"
    );
    console.log(`Download URL: ${downloadURL}`);
    return downloadURL;
  } catch (err: any) {
    console.warn(`Firebase Storage failed, falling back to local Base64 storage: ${err.message || err}`, err);
    
    // Fallback block: Resize and compress to a small, Firestore-safe JPEG Base64 URI
    try {
      let bToUse = file;
      if (file instanceof File) {
        // Compress to a highly efficient 500px width jpeg for rapid saving
        bToUse = await resizeImage(file, 500);
      }
      const b64 = await blobToBase64(bToUse);
      console.log(`Base64 fallback complete. Size: ${Math.round(b64.length / 1024)} KB.`);
      return b64;
    } catch (fallbackErr: any) {
      console.error("Base64 fallback failed inside uploadImage:", fallbackErr);
      throw new Error(`Failed to process image: ${err.message || err}`);
    }
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  if (!url || !url.startsWith('https://firebasestorage.googleapis.com')) {
    return;
  }
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    console.log(`Successfully deleted storage image: ${url}`);
  } catch (err) {
    console.warn(`Failed to delete image from storage (non-blocking):`, err);
  }
};
