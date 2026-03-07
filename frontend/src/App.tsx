import React, { useState } from 'react'
import { postChat, postCode, postEmbedding } from './api/client'

type Tab = 'chat' | 'code' | 'embedding'

function App() {
  const [tab, setTab] = useState<Tab>('chat')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      let data: any
      if (tab === 'chat') data = await postChat(input)
      else if (tab === 'code') data = await postCode(input)
      else data = await postEmbedding(input)
      setResult(data)
    } catch (e: any) {
      setError(e?.message ?? 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <span className="brand-badge" />
          <div>
            <div className="title">AI Platform</div>
            <div className="subtitle">Chat, Code, and Embeddings</div>
          </div>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>Chat</button>
          <button className={`tab ${tab === 'code' ? 'active' : ''}`} onClick={() => setTab('code')}>Code</button>
          <button className={`tab ${tab === 'embedding' ? 'active' : ''}`} onClick={() => setTab('embedding')}>Embedding</button>
        </div>
      </div>

      <div className="card">
        <div className="panel">
          <div className="field">
            <label className="label">{tab === 'embedding' ? 'Text' : 'Prompt'}</label>
            <textarea
              className="textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              placeholder={tab === 'embedding' ? 'Enter text to embed' : 'Enter a prompt'}
            />
          </div>
          <div className="actions">
            <button className="btn" onClick={submit} disabled={loading || !input.trim()}>
              {loading ? 'Sending...' : 'Send'}
            </button>
            {error && <span className="error">{error}</span>}
          </div>
        </div>
        <div className="result">
          <pre>
            {result ? JSON.stringify(result, null, 2) : 'No result'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App
