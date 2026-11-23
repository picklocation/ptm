import { fitSize, largeRule } from "./image-sizes";

// Prepares a photo in the browser before it is sent. Any size and shape is
// accepted: large camera photos are shrunk so the request stays well under the
// host's size limit (about 4.5 MB), and the server then makes the final sizes.
const MAX_BYTES = 3_500_000;
// Some phone browsers refuse canvases above about 16 million pixels.
const MAX_PIXELS = 12_000_000;

async function decode(file: File) {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    return {
      source: bitmap as CanvasImageSource,
      width: bitmap.width,
      height: bitmap.height,
      close: () => bitmap.close(),
    };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return {
        source: img as CanvasImageSource,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      };
    } catch {
      URL.revokeObjectURL(url);
      return null;
    }
  }
}

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );

// Returns the file to send and the original's size in pixels (0 if the browser
// could not read it).
export async function prepareImage(
  file: File,
): Promise<{ file: File; width: number; height: number }> {
  const image = await decode(file);
  if (!image) {
    // The browser could not read it. Send it as it is if the host will take it.
    if (file.size <= MAX_BYTES) return { file, width: 0, height: 0 };
    throw new Error(
      "This photo could not be prepared in your browser. Try a JPEG or PNG under 4 MB.",
    );
  }
  try {
    let { width, height } = fitSize(image.width, image.height, largeRule);
    const pixels = width * height;
    if (pixels > MAX_PIXELS) {
      const shrink = Math.sqrt(MAX_PIXELS / pixels);
      width = Math.max(1, Math.round(width * shrink));
      height = Math.max(1, Math.round(height * shrink));
    }
    const resized = width < image.width || height < image.height;
    const original = { width: image.width, height: image.height };
    if (!resized && file.size <= 1_500_000) return { file, ...original };
    for (let attempt = 0; attempt < 5; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) break;
      // JPEG has no transparency; a white background avoids black corners.
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image.source, 0, 0, width, height);
      for (const quality of [0.9, 0.8, 0.7]) {
        const blob = await toBlob(canvas, quality);
        if (blob && blob.size <= MAX_BYTES)
          return {
            file: new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
              type: "image/jpeg",
            }),
            ...original,
          };
      }
      width = Math.max(1, Math.round(width * 0.8));
      height = Math.max(1, Math.round(height * 0.8));
    }
    if (file.size <= MAX_BYTES) return { file, ...original };
    throw new Error(
      "This photo is too large to upload from this browser. Try a smaller version of it.",
    );
  } finally {
    image.close();
  }
}

// A readable message for an upload that the server or host refused.
export async function uploadFailure(response: Response) {
  const body = await response.json().catch(() => null);
  if (body?.error) return String(body.error);
  if (response.status === 413)
    return "That photo is too large to upload. Try a smaller version of it.";
  return "Upload failed. Please try again.";
}
