/**
 * Supabase database types for ClaimTrack.
 *
 * To regenerate from your live Supabase project run:
 *   npx supabase gen types typescript --project-id qzlndajqqneafxnqozzr > types/database.ts
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "payment_claims_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_claims_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "retentions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retentions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "notification_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
