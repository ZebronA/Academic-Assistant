export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: { id: string; user_id: string; course_id: string | null; recurring_requirement_id: string | null; title: string; description: string | null; task_type: string; status: string; estimated_minutes: number | null; due_at: string | null; completed_at: string | null; source: string; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; course_id?: string | null; recurring_requirement_id?: string | null; title: string; description?: string | null; task_type?: string; status?: string; estimated_minutes?: number | null; due_at?: string | null; completed_at?: string | null; source?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
    };
  };
};
