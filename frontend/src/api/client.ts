function join(base: string, path: string) {
  const b = base.endsWith('/') ? base.slice(0, -1) : base
  return `${b}${path}`
}

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? 'https://ai.krrishna.online'

export async function postChat(prompt: string) {
  const res = await fetch(join(API_BASE, `/chat?prompt=${encodeURIComponent(prompt)}`), {
    method: 'POST'
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function postCode(prompt: string) {
  const res = await fetch(join(API_BASE, `/code?prompt=${encodeURIComponent(prompt)}`), {
    method: 'POST'
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function postEmbedding(text: string) {
  const res = await fetch(join(API_BASE, `/embedding?text=${encodeURIComponent(text)}`), {
    method: 'POST'
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
