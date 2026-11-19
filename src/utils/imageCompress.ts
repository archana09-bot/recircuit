export interface CompressedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
}

export async function compressImageFile(file: File, maxDimension = 1280): Promise<CompressedImage> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.readAsDataURL(file);
  });

  return compressImageDataUrl(dataUrl, maxDimension);
}

export async function compressImageFromUrl(url: string, maxDimension = 1280): Promise<CompressedImage> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not load sample photo.');
  }
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read sample photo.'));
    reader.readAsDataURL(blob);
  });
  return compressImageDataUrl(dataUrl, maxDimension);
}

async function compressImageDataUrl(dataUrl: string, maxDimension: number): Promise<CompressedImage> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Invalid image format.'));
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process image in browser.');
  }
  ctx.drawImage(img, 0, 0, width, height);

  const outputMime = 'image/jpeg';
  const compressedUrl = canvas.toDataURL(outputMime, 0.84);
  const base64 = compressedUrl.replace(/^data:[^;]+;base64,/, '');

  return {
    dataUrl: compressedUrl,
    base64,
    mimeType: outputMime,
  };
}
