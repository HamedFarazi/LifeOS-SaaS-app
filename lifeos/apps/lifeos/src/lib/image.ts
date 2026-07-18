/** Accepted image MIME types for profile uploads. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Reads an image file, downscales it to fit within `max`×`max` while keeping
 * aspect ratio, and returns a compressed JPEG data URL safe to store in
 * LocalStorage.
 *
 * @param file - The user-selected image file.
 * @param max - Maximum width/height in pixels (defaults to 256).
 * @returns A promise resolving to a base64 data URL.
 */
export function resizeImageToDataUrl(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('failed to load image'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
