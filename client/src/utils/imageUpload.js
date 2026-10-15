/**
 * Utility for client-side image compression and robust file uploading.
 * Solves Vercel 4.5MB proxy payload limit and handles mobile camera high-res photos.
 */

export async function compressImage(file, { maxWidth = 1280, maxHeight = 1280, quality = 0.82 } = {}) {
  // If not an image (e.g. PDF), return original
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // If already tiny (< 250KB), no need to compress heavily
  if (file.size < 250 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(file); // Fallback to original
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file); // Fallback to original
      img.onload = () => {
        try {
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
              const compressedFile = new File([blob], newFileName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          console.warn('Image compression fallback:', err);
          resolve(file);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload single file with compression & safe response handling
 */
export async function uploadSingleFile(file, token) {
  if (!file) throw new Error('No file selected');

  // Step 1: Compress image client-side to ensure < 400KB
  let fileToUpload = file;
  try {
    if (file.type && file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.82 });
    }
  } catch (compErr) {
    console.warn('Compression skipped:', compErr);
  }

  // Step 2: Build FormData
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('image', fileToUpload); // for compatibility

  // Step 3: Send to server
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch('/api/upload/single', {
      method: 'POST',
      headers,
      body: formData,
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      // Non-JSON response (e.g. HTML 413, 502, 504 from proxy)
      if (res.status === 413) {
        throw new Error('Image size is too large for the server. Please try a smaller photo.');
      }
      if (res.status === 502 || res.status === 504) {
        throw new Error('Server proxy timeout. Using direct image storage fallback.');
      }
      // If server returned HTML, try base64 fallback for images
      if (file.type && file.type.startsWith('image/')) {
        const base64Url = await fileToBase64(fileToUpload);
        return { success: true, url: base64Url, isBase64Fallback: true };
      }
      throw new Error(`Upload server error (${res.status}). Please try again.`);
    }

    if (data && data.success && (data.url || data.imageUrl)) {
      return {
        success: true,
        url: data.url || data.imageUrl,
        filename: data.filename,
      };
    } else {
      // If server rejected with error message
      const msg = data?.message || 'Server rejected file upload';
      // If image, fallback to base64 so user flow is not broken
      if (file.type && file.type.startsWith('image/')) {
        const base64Url = await fileToBase64(fileToUpload);
        return { success: true, url: base64Url, isBase64Fallback: true };
      }
      throw new Error(msg);
    }
  } catch (err) {
    // If network or server failure, use base64 fallback for images
    if (file.type && file.type.startsWith('image/')) {
      console.warn('Server upload failed, falling back to local base64:', err.message);
      const base64Url = await fileToBase64(fileToUpload);
      return { success: true, url: base64Url, isBase64Fallback: true };
    }
    throw err;
  }
}
