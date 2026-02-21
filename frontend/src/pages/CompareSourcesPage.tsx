import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBrief } from '../api'
import type { Brief } from '../api'

export default function CompareSourcesPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [brief, setBrief] = useState<Brief | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!id) return
        getBrief(Number(id))
            .then(b => { setBrief(b); setLoading(false) })
            .catch(e => { setError(e.message); setLoading(false) })
    }, [id])

    if (loading) return (
        <div className="page" style={{ textAlign: 'center', paddingTop: 120 }}>
            <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        </div>
    )

    if (error || !brief) return (
        <div className="page">
            <div className="empty-state">
                <h3>{error || 'Brief not found'}</h3>
            </div>
        </div>
    )

    // Build compare matrix: key_points grouped by source
    const sourceMap: Record<string, { title: string; points: string[] }> = {}
    for (const src of brief.sources) {
        sourceMap[src.url] = { title: src.title || src.url, points: [] }
    }
    for (const kp of brief.key_points) {
        if (sourceMap[kp.source_url]) {
            sourceMap[kp.source_url].points.push(kp.point)
        }
    }

    const sources = Object.entries(sourceMap)

    return (
        <div className="page fade-up">
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(`/brief/${id}`)}>
                Back to Brief
            </button>
            <h1 className="page-title">Compare Sources</h1>
            <p className="page-subtitle">{brief.title}</p>

            <div style={{ marginBottom: 20 }}>
                {brief.topic_tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th style={{ minWidth: 160 }}>Source</th>
                            <th>Key Points from This Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sources.map(([url, data]) => (
                            <tr key={url}>
                                <td>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 5 }}>
                                        {data.title === url ? '' : data.title}
                                    </div>
                                    <a className="src-url" href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                                </td>
                                <td>
                                    {data.points.length === 0 ? (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No key points attributed to this source</span>
                                    ) : (
                                        <ul style={{ paddingLeft: 16 }}>
                                            {data.points.map((p, i) => (
                                                <li key={i} style={{ marginBottom: 7, fontSize: '0.87rem' }}>{p}</li>
                                            ))}
                                        </ul>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Conflicts panel */}
            {brief.conflicting_claims.length > 0 && (
                <div className="card" style={{ marginTop: 28 }}>
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
        </div>
    )
}
