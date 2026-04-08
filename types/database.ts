/**
 * Supabase database types for ClaimTrack.
 *
 * To regenerate from your live Supabase project run:
 *   npx supabase gen types typescript --project-id <project-id> > types/database.ts
 *
 * The types below are manually maintained until Week 2 when the schema is stable.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string
          name: string
          abn: string | null
          state: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          abn?: string | null
          state: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          abn?: string | null
          state?: string
          created_at?: string
        }
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          org_id: string
          name: string
          head_contractor: string
          contract_value: number
          retention_percentage: number
          state: string
          contract_start_date: string
          practical_completion_date: string | null
          defects_liability_period_days: number
          status: 'active' | 'completed' | 'disputed' | 'archived'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          head_contractor: string
          contract_value: number
          retention_percentage?: number
          state: string
          contract_start_date: string
          practical_completion_date?: string | null
          defects_liability_period_days?: number
          status?: 'active' | 'completed' | 'disputed' | 'archived'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          head_contractor?: string
          contract_value?: number
          retention_percentage?: number
          state?: string
          contract_start_date?: string
          practical_completion_date?: string | null
          defects_liability_period_days?: number
          status?: 'active' | 'completed' | 'disputed' | 'archived'
          notes?: string | null
          created_at?: string
        }
      }
      payment_claims: {
        Row: {
          id: string
          project_id: string
          org_id: string
          claim_number: string
          reference_date: string
          amount_claimed: number
          amount_paid: number | null
          response_due_date: string
          adjudication_window_end: string
          status: 'submitted' | 'response_received' | 'paid' | 'disputed' | 'adjudication' | 'overdue'
          payment_schedule_received: boolean
          payment_schedule_date: string | null
          payment_schedule_amount: number | null
          notes: string | null
          document_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          org_id: string
          claim_number: string
          reference_date: string
          amount_claimed: number
          amount_paid?: number | null
          response_due_date: string
          adjudication_window_end: string
          status?: 'submitted' | 'response_received' | 'paid' | 'disputed' | 'adjudication' | 'overdue'
          payment_schedule_received?: boolean
          payment_schedule_date?: string | null
          payment_schedule_amount?: number | null
          notes?: string | null
          document_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          org_id?: string
          claim_number?: string
          reference_date?: string
          amount_claimed?: number
          amount_paid?: number | null
          response_due_date?: string
          adjudication_window_end?: string
          status?: 'submitted' | 'response_received' | 'paid' | 'disputed' | 'adjudication' | 'overdue'
          payment_schedule_received?: boolean
          payment_schedule_date?: string | null
          payment_schedule_amount?: number | null
          notes?: string | null
          document_path?: string | null
          created_at?: string
        }
      }
      retentions: {
        Row: {
          id: string
          project_id: string
          org_id: string
          total_retention_held: number
          pc_release_date: string | null
          pc_release_amount: number | null
          pc_release_status: 'pending' | 'released' | 'overdue'
          dlp_release_date: string | null
          dlp_release_amount: number | null
          dlp_release_status: 'pending' | 'released' | 'overdue'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          org_id: string
          total_retention_held: number
          pc_release_date?: string | null
          pc_release_amount?: number | null
          pc_release_status?: 'pending' | 'released' | 'overdue'
          dlp_release_date?: string | null
          dlp_release_amount?: number | null
          dlp_release_status?: 'pending' | 'released' | 'overdue'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          org_id?: string
          total_retention_held?: number
          pc_release_date?: string | null
          pc_release_amount?: number | null
          pc_release_status?: 'pending' | 'released' | 'overdue'
          dlp_release_date?: string | null
          dlp_release_amount?: number | null
          dlp_release_status?: 'pending' | 'released' | 'overdue'
          notes?: string | null
          created_at?: string
        }
      }
      notification_log: {
        Row: {
          id: string
          org_id: string
          entity_type: 'payment_claim' | 'retention'
          entity_id: string
          notification_type: string
          sent_at: string
        }
        Insert: {
          id?: string
          org_id: string
          entity_type: 'payment_claim' | 'retention'
          entity_id: string
          notification_type: string
          sent_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          entity_type?: 'payment_claim' | 'retention'
          entity_id?: string
          notification_type?: string
          sent_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
