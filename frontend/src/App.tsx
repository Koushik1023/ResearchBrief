import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Component, type ReactNode, type ErrorInfo } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import BriefDetailPage from './pages/BriefDetailPage'
import SavedBriefsPage from './pages/SavedBriefsPage'
import CompareSourcesPage from './pages/CompareSourcesPage'
import StatusPage from './pages/StatusPage'

interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('React ErrorBoundary caught:', error, info)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '48px 24px', maxWidth: 800, margin: '0 auto',
          fontFamily: 'monospace', color: '#dc2626',
          background: '#f9fafb', minHeight: '100vh'
        }}>
          <h1 style={{ marginBottom: 16, fontSize: 22 }}>Application Error</h1>
          <p style={{ marginBottom: 12, color: '#111827' }}>
            The application encountered an unexpected error. Check the browser console for details.
          </p>
          <pre style={{
            background: '#f3f4f6', padding: 20, borderRadius: 6,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13,
            border: '1px solid #e5e7eb', color: '#b91c1c'
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/briefs" element={<SavedBriefsPage />} />
          <Route path="/brief/:id" element={<BriefDetailPage />} />
          <Route path="/brief/:id/compare" element={<CompareSourcesPage />} />
          <Route path="/status" element={<StatusPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
