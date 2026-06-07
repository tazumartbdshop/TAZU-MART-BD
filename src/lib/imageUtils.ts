import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

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

export const uploadImage = async (file: File | Blob, folder: string, originalName?: string): Promise<string> => {
  const extension = originalName?.split('.').pop() || 'jpg';
  const cleanName = originalName ? originalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) : `img-${Date.now()}`;
  const fileName = `${Date.now()}-${cleanName}.${extension}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
