export function parseToBullets(text: string | null): string[] {
  if (!text) return [];
  
  // Split by newlines, bullet markers, or common separators
  return text
    .split(/\n|•|-\s+/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

