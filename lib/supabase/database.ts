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
      foreignKeyName: "assessments_unit_id_fkey";
      columns: ["unit_id"];
      isOneToOne: false;
      referencedRelation: "units;
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
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Json>;
  };
};
