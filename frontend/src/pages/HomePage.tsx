import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBrief } from '../api'

type ProgressStatus = 'waiting' | 'loading' | 'done' | 'error'

interface UrlProgress {
    url: string
    status: ProgressStatus
    label: string
}

const PLACEHOLDER = `https://example.com/article-1
https://example.com/article-2
https://example.com/article-3`

export default function HomePage() {
    const [input, setInput] = useState('')
    const [error, setError] = useState('')
    const [progress, setProgress] = useState<UrlProgress[]>([])
    const [generating, setGenerating] = useState(false)
    const navigate = useNavigate()

    const parseUrls = (val: string): string[] =>
        val.split('\n').map(u => u.trim()).filter(u => u.length > 0)

    const validateUrls = (urls: string[]): string => {
        if (urls.length === 0) return 'Please paste at least one URL.'
        if (urls.length > 10) return 'Maximum 10 URLs allowed.'
        const invalid = urls.filter(u => {
            try { new URL(u); return false } catch { return true }
        })
        if (invalid.length) return `Invalid URL${invalid.length > 1 ? 's' : ''}:\n${invalid.join('\n')}`
        return ''
    }

    const handleGenerate = async () => {
        setError('')
        const urls = parseUrls(input)
        const err = validateUrls(urls)
        if (err) { setError(err); return }

        setProgress(urls.map(url => ({ url, status: 'waiting', label: 'Waiting' })))
        setGenerating(true)

        const animate = () => {
            setProgress(prev => prev.map((p, i) => {
                if (i === 0 || prev[i - 1].status === 'done') {
                    if (p.status === 'waiting') return { ...p, status: 'loading', label: 'Fetching & cleaning' }
                }
                return p
            }))
        }
        const interval = setInterval(animate, 600)

        try {
            const brief = await createBrief(urls)
            clearInterval(interval)
            setProgress(prev => prev.map(p => ({ ...p, status: 'done', label: 'Done' })))
            setTimeout(() => navigate(`/brief/${brief.id}`), 500)
        } catch (e: any) {
            clearInterval(interval)
            const msg = e.response?.data?.detail || e.message || 'Unknown error'
            setError(msg)
            setProgress(prev => prev.map(p => ({ ...p, status: 'error', label: 'Failed' })))
            setGenerating(false)
        }
    }

    const urlCount = parseUrls(input).length

    return (
        <>
            {/* Hero */}
            <div className="hero">
                <h1 className="hero-title">Turn links into<br />research briefs</h1>
                <p className="hero-sub">
                    Paste 5–10 article links. Our AI fetches, reads, and synthesises them into a
                    structured brief with key insights, citations, and a verification checklist.
                </p>

                {/* Steps */}
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-num">1</div>
                        <div className="step-title">Paste Links</div>
                        <div className="step-desc">One URL per line, up to 10 articles, docs, or blog posts.</div>
                    </div>
                    <div className="step-card">
                        <div className="step-num">2</div>
                        <div className="step-title">AI Analyses</div>
                        <div className="step-desc">We fetch and clean each page, then ask an LLM to synthesise the content.</div>
                    </div>
                    <div className="step-card">
                        <div className="step-num">3</div>
                        <div className="step-title">Get Your Brief</div>
                        <div className="step-desc">Summary, key points, citation links, conflict detection, and a checklist.</div>
                    </div>
                </div>

                {/* Input */}
                <div className="input-card fade-up">
                    <p className="section-label">Paste your URLs — one per line</p>

                    {error && (
                        <div className="error-banner" role="alert">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <textarea
                        rows={7}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={PLACEHOLDER}
                        disabled={generating}
                    />
                    <div className="input-hint">
                        {urlCount > 0 ? `${urlCount} URL${urlCount !== 1 ? 's' : ''} detected` : 'Min 1 · Max 10 URLs'}
                    </div>

                    {progress.length > 0 && (
                        <ul className="progress-list">
                            {progress.map((p, i) => (
                                <li key={i} className={`progress-item ${p.status}`}>
                                    {p.status === 'loading'
                                        ? <span className="spinner" />
                                        : <span className="status-dot" style={{
                                            background: p.status === 'done'
                                                ? 'var(--success)'
                                                : p.status === 'error'
                                                    ? 'var(--error)'
                                                    : 'var(--border)'
                                        }} />
                                    }
                                    <span style={{ flex: 1, wordBreak: 'break-all' }}>{p.url}</span>
                                    <span className="progress-status-label">{p.label}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="input-actions">
                        {generating && <span className="char-count">Generating...</span>}
                        <button
                            className="btn btn-primary"
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? <><span className="spinner" /> Analysing...</> : 'Generate Brief'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
