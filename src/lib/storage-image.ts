// width and quality params kept for API compatibility — transformation endpoint requires Pro plan
export function storageImg(url: string | null | undefined, _width?: number, _quality?: number): string {
  return url ?? "";
}
