export function isImage(ext: string): boolean {
  const imageTypes = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'avif', 'apng'];
  return imageTypes.includes(ext);
}

export function isVideo(ext: string): boolean {
  const videoTypes = ['mp4', 'ogg', 'webm'];
  return videoTypes.includes(ext);
}