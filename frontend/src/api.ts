import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE })

export interface KeyPoint {
  point: string
  source_url: string
  snippet: string
}

export interface ConflictingClaim {
  topic: string
  claim_a: string
  source_a: string
  claim_b: string
  source_b: string
}

export interface Source {
  id: number
  url: string
  title: string | null
  snippet: string | null
}

export interface BriefListItem {
  id: number
  title: string
  topic_tags: string[]
  created_at: string
  source_count: number
}

export interface Brief {
  id: number
  title: string
  summary: string
  key_points: KeyPoint[]
  conflicting_claims: ConflictingClaim[]
  verify_checklist: string[]
  topic_tags: string[]
  created_at: string
  sources: Source[]
}

export interface HealthStatus {
  backend: string
  database: string
  llm: string
}

export const createBrief = (urls: string[]) =>
  api.post<Brief>('/api/briefs', { urls }).then(r => r.data)

export const listBriefs = () =>
  api.get<BriefListItem[]>('/api/briefs').then(r => r.data)

export const getBrief = (id: number) =>
  api.get<Brief>(`/api/briefs/${id}`).then(r => r.data)

export const getHealth = () =>
  api.get<HealthStatus>('/api/health').then(r => r.data)
