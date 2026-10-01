type Json = Record<string, unknown>;

type Table = {
  Row: Json;
  Insert: Json;
  Update: Json;
  Relationships: [];
};

type AssessmentTable = {
  Row: Json;
  Insert: Json;
  Update: Json;
  Relationships: [
    {
      foreignKeyName: "assessments_course_id_fkey";
      columns: ["course_id"];
      isOneToOne: false;
      referencedRelation: "courses";
      referencedColumns: ["id"];
    }
  ];
};

export type Database = {
  public: {
    Tables: Record<string, Table> & {
      assessments: AssessmentTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Json>;
  };
};
