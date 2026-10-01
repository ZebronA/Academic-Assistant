export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationships = [];

type AcademicEvent = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string | null;
    task_id: string | null;
    assessment_id: string | null;
    event_type: string;
    occurred_at: string;
    title: string;
    notes: string | null;
    source: string;
    confirmation_status: string;
    duration_minutes: number | null;
    metadata: Json;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id?: string | null;
    task_id?: string | null;
    assessment_id?: string | null;
    event_type: string;
    occurred_at?: string;
    title: string;
    notes?: string | null;
    source?: string;
    confirmation_status: string;
    duration_minutes?: number | null;
    metadata?: Json;
    created_at?: string;
  };
  Update: Partial<AcademicEvent["Insert"]>;
  Relationships: Relationships;
};

type AcademicPeriod = {
  Row: {
    id: string;
    user_id: string;
    name: string;
    starts_on: string | null;
    ends_on: string | null;
    is_current: boolean;
    created_at: string;
    updated_at: string;
    academic_year_id: string;
    semester: number;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    starts_on?: string | null;
    ends_on?: string | null;
    is_current?: boolean;
    created_at?: string;
    updated_at?: string;
    academic_year_id: string;
    semester: number;
  };
  Update: Partial<AcademicPeriod["Insert"]>;
  Relationships: Relationships;
};

type AcademicYear = {
  Row: {
    id: string;
    user_id: string;
    name: string;
    starts_on: string | null;
    ends_on: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    starts_on?: string | null;
    ends_on?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<AcademicYear["Insert"]>;
  Relationships: Relationships;
};

type Assessment = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string;
    title: string;
    assessment_type: string;
    status: string;
    starts_at: string | null;
    due_at: string | null;
    weight_percent: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id: string;
    title: string;
    assessment_type: string;
    status?: string;
    starts_at?: string | null;
    due_at?: string | null;
    weight_percent?: number | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<Assessment["Insert"]>;
  Relationships: [{
    foreignKeyName: "assessments_unit_id_fkey";
    columns: ["unit_id"];
    isOneToOne: false;
    referencedRelation: "units";
    referencedColumns: ["id"];
  }];
};

type Observation = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string | null;
    task_id: string | null;
    assessment_id: string | null;
    content: string;
    observed_at: string;
    source: string;
    confidence: number | null;
    confirmation_status: string;
    metadata: Json;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id?: string | null;
    task_id?: string | null;
    assessment_id?: string | null;
    content: string;
    observed_at?: string;
    source?: string;
    confidence?: number | null;
    confirmation_status: string;
    metadata?: Json;
    created_at?: string;
  };
  Update: Partial<Observation["Insert"]>;
  Relationships: Relationships;
};

type Profile = {
  Row: {
    id: string;
    full_name: string | null;
    timezone: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    full_name?: string | null;
    timezone?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<Profile["Insert"]>;
  Relationships: Relationships;
};

type RecurringRequirement = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string;
    title: string;
    description: string | null;
    frequency: string;
    starts_on: string | null;
    ends_on: string | null;
    is_active: boolean;
    configuration: Json;
    source: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id: string;
    title: string;
    description?: string | null;
    frequency: string;
    starts_on?: string | null;
    ends_on?: string | null;
    is_active?: boolean;
    configuration?: Json;
    source?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<RecurringRequirement["Insert"]>;
  Relationships: Relationships;
};

type StudySession = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string | null;
    task_id: string | null;
    started_at: string;
    ended_at: string | null;
    duration_minutes: number | null;
    outcome: string | null;
    notes: string | null;
    source: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id?: string | null;
    task_id?: string | null;
    started_at: string;
    ended_at?: string | null;
    duration_minutes?: number | null;
    outcome?: string | null;
    notes?: string | null;
    source?: string;
    created_at?: string;
  };
  Update: Partial<StudySession["Insert"]>;
  Relationships: Relationships;
};

type Task = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string | null;
    title: string;
    description: string | null;
    task_type: string;
    status: string;
    estimated_minutes: number | null;
    due_at: string | null;
    completed_at: string | null;
    source: string;
    created_at: string;
    updated_at: string;
    recurring_requirement_id: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id?: string | null;
    title: string;
    description?: string | null;
    task_type?: string;
    status?: string;
    estimated_minutes?: number | null;
    due_at?: string | null;
    completed_at?: string | null;
    source?: string;
    created_at?: string;
    updated_at?: string;
    recurring_requirement_id?: string | null;
  };
  Update: Partial<Task["Insert"]>;
  Relationships: Relationships;
};

type TimetableEntry = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string | null;
    day_of_week: number;
    starts_at: string;
    ends_at: string;
    location: string | null;
    valid_from: string | null;
    valid_until: string | null;
    is_active: boolean;
    metadata: Json;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id?: string | null;
    day_of_week: number;
    starts_at: string;
    ends_at: string;
    location?: string | null;
    valid_from?: string | null;
    valid_until?: string | null;
    is_active?: boolean;
    metadata?: Json;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<TimetableEntry["Insert"]>;
  Relationships: Relationships;
};

type Unit = {
  Row: {
    id: string;
    user_id: string;
    academic_period_id: string;
    code: string;
    name: string;
    unit_type: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    academic_period_id: string;
    code: string;
    name: string;
    unit_type?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<Unit["Insert"]>;
  Relationships: Relationships;
};

type UnitRelationship = {
  Row: {
    id: string;
    user_id: string;
    from_unit_id: string;
    to_unit_id: string;
    relationship_type: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    from_unit_id: string;
    to_unit_id: string;
    relationship_type?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<UnitRelationship["Insert"]>;
  Relationships: Relationships;
};

type UnitState = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string;
    state: string;
    understanding_level: number | null;
    backlog: boolean;
    last_practiced_at: string | null;
    last_evidence_at: string | null;
    state_reason: string | null;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id: string;
    state?: string;
    understanding_level?: number | null;
    backlog?: boolean;
    last_practiced_at?: string | null;
    last_evidence_at?: string | null;
    state_reason?: string | null;
    updated_at?: string;
  };
  Update: Partial<UnitState["Insert"]>;
  Relationships: Relationships;
};

type UnitStateHistory = {
  Row: {
    id: string;
    user_id: string;
    unit_id: string;
    state: string;
    understanding_level: number | null;
    backlog: boolean | null;
    reason: string | null;
    recorded_at: string;
    source: string;
    metadata: Json;
  };
  Insert: {
    id?: string;
    user_id: string;
    unit_id: string;
    state: string;
    understanding_level?: number | null;
    backlog?: boolean | null;
    reason?: string | null;
    recorded_at?: string;
    source?: string;
    metadata?: Json;
  };
  Update: Partial<UnitStateHistory["Insert"]>;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      academic_events: AcademicEvent;
      academic_periods: AcademicPeriod;
      academic_years: AcademicYear;
      assessments: Assessment;
      observations: Observation;
      profiles: Profile;
      recurring_requirements: RecurringRequirement;
      study_sessions: StudySession;
      tasks: Task;
      timetable_entries: TimetableEntry;
      unit_relationships: UnitRelationship;
      unit_state_history: UnitStateHistory;
      unit_states: UnitState;
      units: Unit;
    };
    Views: Record<string, never>;
    Functions: {
      create_current_academic_period: {
        Args: {
          p_name: string;
          p_academic_year: string;
          p_semester: number;
          p_starts_on: string;
          p_ends_on: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
