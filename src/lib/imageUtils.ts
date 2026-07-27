import { getSupabase } from './supabase';

// Helper to add timeout to promise
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> => {
  let finished = false;
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      if (!finished) reject(new Error(errorMessage));
    }, ms);
  });

  return Promise.race([
    promise.then(res => { finished = true; return res; }).catch(err => { finished = true; throw err; }),
    timeoutPromise
  ]);
};

export const resizeImage = (file: Blob | File, maxWidth: number = 800): Promise<Blob> => {
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

export const uploadImage = async (
  file: File | Blob, 
  folder: string, 
  originalName?: string,
  bucketName: string = 'media'
): Promise<string> => {
  try {
    console.log(`Starting upload to local server...`);
    const formData = new FormData();
    formData.append('file', file, originalName || 'file.jpg');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload API returned error status ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.url) {
      throw new Error("Upload API did not return a valid URL");
    }

    console.log(`Upload complete! Local path: ${data.url}`);
    return data.url;
  } catch (err: any) {
    console.warn(`Local server upload failed, falling back to compressed base64: ${err.message || err}`, err);
    return fallbackToBase64(file);
  }
};

async function fallbackToBase64(file: File | Blob): Promise<string> {
    try {
      // Compress to a highly efficient 500px width jpeg for rapid saving
      const bToUse = await resizeImage(file, 500);
      const b64 = await blobToBase64(bToUse);
      console.log(`Base64 fallback complete. Size: ${Math.round(b64.length / 1024)} KB.`);
      return b64;
    } catch (fallbackErr: any) {
      console.error("Base64 fallback failed inside uploadImage:", fallbackErr);
      throw new Error(`Failed to process image`);
    }
}

export const deleteImage = async (url: string): Promise<void> => {
  if (!url) {
    return;
  }
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    
    // Match any Supabase storage public URL structure automatically
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match) {
       const bucketName = match[1];
       const path = match[2];
       await supabase.storage.from(bucketName).remove([path]);
       console.log(`Successfully deleted storage image from bucket '${bucketName}': ${path}`);
    } else if (url.includes('supabase.co/storage/v1/object/public/media/')) {
       const urlParts = url.split('supabase.co/storage/v1/object/public/media/');
       if (urlParts.length > 1) {
          const path = urlParts[1];
          await supabase.storage.from('media').remove([path]);
          console.log(`Successfully deleted storage image: ${path}`);
       }
    }
  } catch (err) {
    console.warn(`Failed to delete image from storage (non-blocking):`, err);
  }
};
