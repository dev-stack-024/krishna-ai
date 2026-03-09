function join(base: string, path: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${b}${path}`;
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ?? "https://ai.krrishna.online";

async function handleStream(
  res: Response,
  onProgress?: (text: string) => void,
) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            fullText += parsed.response;
            if (onProgress) onProgress(fullText);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
  return fullText;
}

export async function postGenerate(
  prompt: string,
  onProgress?: (text: string) => void,
) {
  const res = await fetch(
    join(API_BASE, "/generate"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    },
  );
  return handleStream(res, onProgress);
}
