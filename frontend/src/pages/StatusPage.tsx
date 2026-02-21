import { useEffect, useState } from 'react'
import { getHealth } from '../api'
import type { HealthStatus } from '../api'

interface ServiceStatus {
    key: keyof HealthStatus
    label: string
    description: string
}

const SERVICES: ServiceStatus[] = [
    { key: 'backend', label: 'Backend API', description: 'FastAPI server availability' },
    { key: 'database', label: 'Database', description: 'SQLite connection & read/write' },
    { key: 'llm', label: 'LLM (Groq)', description: 'llama-3.3-70b-versatile via Groq API' },
]

export default function StatusPage() {
    const [health, setHealth] = useState<HealthStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [lastChecked, setLastChecked] = useState<Date | null>(null)

    const checkHealth = () => {
        setLoading(true)
        setError('')
        getHealth()
            .then(h => { setHealth(h); setLastChecked(new Date()); setLoading(false) })
            .catch(e => { setError(e.message || 'Cannot reach backend'); setLoading(false) })
    }

    useEffect(() => { checkHealth() }, [])

    const allOk = health && Object.values(health).every(v => v === 'ok')

    return (
        <div className="page fade-up">
            <h1 className="page-title">System Status</h1>
            <p className="page-subtitle">
                Live health of all backend services
                {lastChecked && <> · Last checked: {lastChecked.toLocaleTimeString()}</>}
            </p>

            {/* Overall banner */}
            {!loading && health && (
                <div style={{
                    background: allOk ? '#d1fae5' : '#fee2e2',
                    border: `1px solid ${allOk ? '#6ee7b7' : '#fca5a5'}`,
                    borderRadius: 'var(--radius)', padding: '14px 20px',
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                }}>
                    <span className={`status-dot ${allOk ? 'dot-ok' : 'dot-error'}`} />
                    <span style={{ fontWeight: 600, color: allOk ? 'var(--success)' : 'var(--error)', fontSize: '0.92rem' }}>
                        {allOk ? 'All systems operational' : 'One or more services are degraded'}
                    </span>
                </div>
            )}

            {error && (
                <div className="error-banner">
                    {error} — Make sure the backend is running at{' '}
                    <code>{import.meta.env.VITE_API_URL || 'http://localhost:8000'}</code>
                </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
                {SERVICES.map(svc => {
                    const status = health?.[svc.key]
                    const isOk = status === 'ok'
                    const isLoading = loading || !health

                    return (
                        <div key={svc.key} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, marginBottom: 3 }}>{svc.label}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{svc.description}</div>
                                {!isLoading && !isOk && status && (
                                    <div style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 5 }}>
                                        {status}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {isLoading ? (
                                    <><span className="status-dot dot-loading" /><span style={{ color: 'var(--warning)', fontSize: '0.85rem' }}>Checking</span></>
                                ) : (
                                    <>
                                        <span className={`status-dot ${isOk ? 'dot-ok' : 'dot-error'}`} />
                                        <span className={`badge ${isOk ? 'badge-success' : 'badge-error'}`}>
                                            {isOk ? 'Operational' : 'Degraded'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <button
                    className="btn btn-secondary"
                    onClick={checkHealth}
                    disabled={loading}
                >
                    {loading ? <><span className="spinner" /> Checking...</> : 'Refresh'}
                </button>
            </div>

            {/* Tech info card */}
            <div className="card" style={{ marginTop: 28 }}>
                <p className="section-label">Tech Stack</p>
                <table style={{ width: '100%', fontSize: '0.87rem', borderCollapse: 'collapse' }}>
                    <tbody>
                        {[
                            ['Backend', 'FastAPI (Python 3.11)'],
                            ['Database', 'SQLite via SQLAlchemy'],
                            ['Content Extraction', 'trafilatura + BeautifulSoup4'],
                            ['LLM Provider', 'Groq API'],
                            ['LLM Model', 'llama-3.3-70b-versatile'],
                            ['Frontend', 'React 18 + Vite (TypeScript)'],
                        ].map(([k, v]) => (
                            <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '10px 0', color: 'var(--text-muted)', width: '40%' }}>{k}</td>
                                <td style={{ padding: '10px 0', fontWeight: 600 }}>{v}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
