import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBrief } from '../api'
import type { Brief } from '../api'

export default function BriefDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [brief, setBrief] = useState<Brief | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [checked, setChecked] = useState<Record<number, boolean>>({})

    useEffect(() => {
        if (!id) return
        setLoading(true)
        getBrief(Number(id))
            .then(b => { setBrief(b); setLoading(false) })
            .catch(e => {
                setError(e.response?.data?.detail || e.message)
                setLoading(false)
            })
    }, [id])

    const toggle = (i: number) => setChecked(prev => ({ ...prev, [i]: !prev[i] }))

    if (loading) return (
        <div className="page" style={{ textAlign: 'center', paddingTop: '120px' }}>
            <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <p style={{ marginTop: 18, color: 'var(--text-muted)' }}>Loading brief...</p>
        </div>
    )

    if (error || !brief) return (
        <div className="page">
            <div className="empty-state">
                <h3>{error || 'Brief not found'}</h3>
                <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Back to Home</button>
            </div>
        </div>
    )

    const date = new Date(brief.created_at).toLocaleString()

    return (
        <div className="page fade-up">
            {/* Header */}
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/briefs')}>Back to Saved</button>
                <Link to={`/brief/${id}/compare`} className="btn btn-secondary btn-sm">Compare Sources</Link>
            </div>

            <h1 className="page-title">{brief.title}</h1>
            <p className="page-subtitle">Generated {date} · {brief.sources.length} source{brief.sources.length !== 1 ? 's' : ''}</p>

            {/* Tags */}
            <div style={{ marginBottom: 24 }}>
                {brief.topic_tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>

            {/* Summary */}
            <div className="card">
                <p className="section-label">Executive Summary</p>
                <p style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>{brief.summary}</p>
            </div>

            {/* Key Points */}
            <div className="card" style={{ marginTop: 16 }}>
                <p className="section-label">Key Points ({brief.key_points.length})</p>
                {brief.key_points.map((kp, i) => (
                    <div className="key-point" key={i}>
                        <div className="key-point-text">{kp.point}</div>
                        {kp.snippet && <div className="key-point-snippet">"{kp.snippet}"</div>}
                        <a className="key-point-src" href={kp.source_url} target="_blank" rel="noopener noreferrer">
                            {kp.source_url}
                        </a>
                    </div>
                ))}
            </div>

            {/* Conflicting Claims */}
            {brief.conflicting_claims.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <p className="section-label">Conflicting Claims</p>
                    {brief.conflicting_claims.map((c, i) => (
                        <div className="conflict-card" key={i}>
                            {c.topic && <strong style={{ fontSize: '0.9rem' }}>{c.topic}</strong>}
                            <div className="conflict-grid">
                                <div className="conflict-side">
                                    <div className="conflict-side-label">Source A</div>
                                    <div className="conflict-claim">{c.claim_a}</div>
                                    <a className="conflict-src" href={c.source_a} target="_blank" rel="noopener noreferrer">{c.source_a}</a>
                                </div>
                                <div className="conflict-side">
                                    <div className="conflict-side-label">Source B</div>
                                    <div className="conflict-claim">{c.claim_b}</div>
                                    <a className="conflict-src" href={c.source_b} target="_blank" rel="noopener noreferrer">{c.source_b}</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Verify Checklist */}
            <div className="card" style={{ marginTop: 16 }}>
                <p className="section-label">What to Verify</p>
                <ul className="checklist">
                    {brief.verify_checklist.map((item, i) => (
                        <li key={i}>
                            <input type="checkbox" id={`chk-${i}`} checked={!!checked[i]} onChange={() => toggle(i)} />
                            <label htmlFor={`chk-${i}`} style={{ textDecoration: checked[i] ? 'line-through' : 'none', color: checked[i] ? 'var(--text-muted)' : 'inherit' }}>
                                {item}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sources */}
            <div className="card" style={{ marginTop: 16 }}>
                <p className="section-label">Sources Used ({brief.sources.length})</p>
                {brief.sources.map(src => (
                    <div className="source-card" key={src.id}>
                        {src.title && <div className="source-title">{src.title}</div>}
                        <a className="source-url" href={src.url} target="_blank" rel="noopener noreferrer">{src.url}</a>
                        {src.snippet && <div className="source-snippet">"{src.snippet}"</div>}
                    </div>
                ))}
            </div>
        </div>
    )
}
