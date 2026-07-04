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
  folder: string = 'media', 
  originalName?: string,
  _bucket?: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file, originalName || 'upload.jpg');

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) throw new Error('Upload failed');
    
    const data = await res.json();
    return data.url;
  } catch (err: any) {
    console.warn(`Upload failed, falling back to compressed local Base64 storage: ${err.message || err}`, err);
    return fallbackToBase64(file);
  }
};

async function fallbackToBase64(file: File | Blob): Promise<string> {
    try {
      const bToUse = await resizeImage(file, 500);
      const b64 = await blobToBase64(bToUse);
      return b64;
    } catch (fallbackErr: any) {
      console.error("Base64 fallback failed inside uploadImage:", fallbackErr);
      throw new Error(`Failed to process image`);
    }
}

export const deleteImage = async (url: string): Promise<void> => {
  // Local deletion would require an API endpoint too if we want to remove files from public/uploads
  console.log("Delete image requested for URL:", url);
};
