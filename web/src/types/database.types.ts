export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      councillors: {
        Row: {
          id: string
          name: string
          name_en: string | null
          party: string | null
          district: string | null
          photo_url: string | null
          term_number: number | null
          is_active: boolean
          email: string | null
          phone: string | null
          office_location: string | null
          profile_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          party?: string | null
          district?: string | null
          photo_url?: string | null
          term_number?: number | null
          is_active?: boolean
          email?: string | null
          phone?: string | null
          office_location?: string | null
          profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          party?: string | null
          district?: string | null
          photo_url?: string | null
          term_number?: number | null
          is_active?: boolean
          email?: string | null
          phone?: string | null
          office_location?: string | null
          profile_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      committees: {
        Row: {
          id: string
          name: string
          name_en: string | null
          type: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          type?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          type?: string | null
          description?: string | null
          created_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          title: string
          meeting_type: string | null
          committee_id: string | null
          meeting_date: string
          session_number: number | null
          meeting_number: number | null
          transcript_url: string | null
          video_url: string | null
          transcript_text: string | null
          is_processed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          meeting_type?: string | null
          committee_id?: string | null
          meeting_date: string
          session_number?: number | null
          meeting_number?: number | null
          transcript_url?: string | null
          video_url?: string | null
          transcript_text?: string | null
          is_processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          meeting_type?: string | null
          committee_id?: string | null
          meeting_date?: string
          session_number?: number | null
          meeting_number?: number | null
          transcript_url?: string | null
          video_url?: string | null
          transcript_text?: string | null
          is_processed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          bill_number: string | null
          title: string
          bill_type: string | null
          proposer_id: string | null
          proposal_date: string | null
          status: string | null
          result: string | null
          summary: string | null
          full_text: string | null
          bill_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bill_number?: string | null
          title: string
          bill_type?: string | null
          proposer_id?: string | null
          proposal_date?: string | null
          status?: string | null
          result?: string | null
          summary?: string | null
          full_text?: string | null
          bill_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bill_number?: string | null
          title?: string
          bill_type?: string | null
          proposer_id?: string | null
          proposal_date?: string | null
          status?: string | null
          result?: string | null
          summary?: string | null
          full_text?: string | null
          bill_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      speeches: {
        Row: {
          id: string
          meeting_id: string
          councillor_id: string | null
          speech_order: number | null
          speech_text: string
          summary: string | null
          keywords: string[] | null
          timestamp_start: number | null
          timestamp_end: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          councillor_id?: string | null
          speech_order?: number | null
          speech_text: string
          summary?: string | null
          keywords?: string[] | null
          timestamp_start?: number | null
          timestamp_end?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          councillor_id?: string | null
          speech_order?: number | null
          speech_text?: string
          summary?: string | null
          keywords?: string[] | null
          timestamp_start?: number | null
          timestamp_end?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          bill_id: string
          councillor_id: string
          vote_cast: string
          is_verified: boolean
          verified_by: string | null
          verified_at: string | null
          source_meeting_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          councillor_id: string
          vote_cast: string
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          source_meeting_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          councillor_id?: string
          vote_cast?: string
          is_verified?: boolean
          verified_by?: string | null
          verified_at?: string | null
          source_meeting_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_speeches: {
        Args: {
          search_query: string
        }
        Returns: {
          id: string
          meeting_id: string
          councillor_id: string | null
          speech_text: string
          summary: string | null
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
