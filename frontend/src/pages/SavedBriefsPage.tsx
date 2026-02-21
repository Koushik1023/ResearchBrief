import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBriefs } from '../api'
import type { BriefListItem } from '../api'

export default function SavedBriefsPage() {
    const [briefs, setBriefs] = useState<BriefListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        listBriefs()
            .then(b => { setBriefs(b); setLoading(false) })
            .catch(e => { setError(e.message); setLoading(false) })
    }, [])

    return (
        <div className="page fade-up">
            <h1 className="page-title">Saved Briefs</h1>
            <p className="page-subtitle">Your last 5 generated research briefs</p>

            {loading && (
                <div style={{ textAlign: 'center', paddingTop: 60 }}>
                    <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
                </div>
            )}

            {error && <div className="error-banner">{error}</div>}

            {!loading && briefs.length === 0 && (
                <div className="empty-state">
                    <h3>No briefs yet</h3>
                    <p>Head to the home page and paste some article links to get started.</p>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
                        Generate a Brief
                    </button>
                </div>
            )}

            {briefs.map(brief => (
                <div
                    key={brief.id}
                    className="brief-card"
                    onClick={() => navigate(`/brief/${brief.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/brief/${brief.id}`)}
                >
                    <div style={{ flex: 1 }}>
                        <div className="brief-card-title">{brief.title}</div>
                        <div style={{ marginBottom: 10 }}>
                            {brief.topic_tags.map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                        <div className="brief-card-meta">
                            {new Date(brief.created_at).toLocaleString()} &nbsp;&middot;&nbsp;
                            {brief.source_count} source{brief.source_count !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', alignSelf: 'center' }}>›</div>
                </div>
            ))}
        </div>
    )
}
