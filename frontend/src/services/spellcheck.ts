import { useState } from 'react';

export async function correctFr(text: string): Promise<string> {
  if (!text.trim()) return text;
  const res = await fetch('https://api.languagetool.org/v2/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ text, language: 'fr' }).toString(),
  });
  const data = await res.json();
  const matches = [...(data.matches ?? [])].sort((a: any, b: any) => b.offset - a.offset);
  let result = text;
  for (const m of matches) {
    if (m.replacements?.length > 0) {
      result = result.slice(0, m.offset) + m.replacements[0].value + result.slice(m.offset + m.length);
    }
  }
  return result;
}

export function useSpellCheck() {
  const [checking, setChecking] = useState(false);
  const [corrected, setCorrected] = useState(false);

  const check = async (
    texts: Record<string, string>,
    onDone: (results: Record<string, string>) => void
  ) => {
    if (!Object.values(texts).some(v => v.trim())) return;
    setChecking(true);
    setCorrected(false);
    try {
      const keys = Object.keys(texts);
      const fixed = await Promise.all(Object.values(texts).map(correctFr));
      onDone(Object.fromEntries(keys.map((k, i) => [k, fixed[i]])));
      setCorrected(true);
      setTimeout(() => setCorrected(false), 2000);
    } catch {
      // silent fail — never disrupt the user's work
    } finally {
      setChecking(false);
    }
  };

  const reset = () => setCorrected(false);

  return { check, checking, corrected, reset };
}
