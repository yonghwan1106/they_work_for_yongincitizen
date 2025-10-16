import { Database } from './database.types'

// Convenience type exports
export type Councillor = Database['public']['Tables']['councillors']['Row']
export type Committee = Database['public']['Tables']['committees']['Row']
export type Meeting = Database['public']['Tables']['meetings']['Row']
export type Bill = Database['public']['Tables']['bills']['Row']
export type Speech = Database['public']['Tables']['speeches']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']

// Extended types with relations
export type CouncillorWithStats = Councillor & {
  speech_count?: number
  bill_count?: number
  committees?: Committee[]
}

export type BillWithProposer = Bill & {
  proposer?: Councillor
}

export type SpeechWithDetails = Speech & {
  councillor?: Councillor
  meeting?: Meeting
}

export type MeetingWithDetails = Meeting & {
  committee?: Committee
  speech_count?: number
}

// Filter and sort types
export type CouncillorFilter = {
  party?: string
  district?: string
  is_active?: boolean
}

export type BillFilter = {
  status?: string
  bill_type?: string
  proposer_id?: string
}

export type MeetingFilter = {
  meeting_type?: string
  committee_id?: string
  date_from?: string
  date_to?: string
}
