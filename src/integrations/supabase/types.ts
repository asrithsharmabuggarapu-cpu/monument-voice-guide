export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          monument_id: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          monument_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          monument_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_monument_id_fkey"
            columns: ["monument_id"]
            isOneToOne: false
            referencedRelation: "monuments"
            referencedColumns: ["id"]
          },
        ]
      }
      monument_images: {
        Row: {
          id: string
          image_url: string
          monument_id: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          image_url: string
          monument_id?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          image_url?: string
          monument_id?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monument_images_monument_id_fkey"
            columns: ["monument_id"]
            isOneToOne: false
            referencedRelation: "monuments"
            referencedColumns: ["id"]
          },
        ]
      }
      monuments: {
        Row: {
          audio_english_url: string | null
          audio_hindi_url: string | null
          audio_telugu_url: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string
          description_english: string | null
          description_hindi: string | null
          description_telugu: string | null
          historical_info: string | null
          historical_info_english: string | null
          historical_info_hindi: string | null
          historical_info_telugu: string | null
          id: string
          image_url: string | null
          location: string
          model_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          audio_english_url?: string | null
          audio_hindi_url?: string | null
          audio_telugu_url?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          description_english?: string | null
          description_hindi?: string | null
          description_telugu?: string | null
          historical_info?: string | null
          historical_info_english?: string | null
          historical_info_hindi?: string | null
          historical_info_telugu?: string | null
          id?: string
          image_url?: string | null
          location: string
          model_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          audio_english_url?: string | null
          audio_hindi_url?: string | null
          audio_telugu_url?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          description_english?: string | null
          description_hindi?: string | null
          description_telugu?: string | null
          historical_info?: string | null
          historical_info_english?: string | null
          historical_info_hindi?: string | null
          historical_info_telugu?: string | null
          id?: string
          image_url?: string | null
          location?: string
          model_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          contact: string | null
          created_at: string | null
          description: string | null
          distance: string | null
          id: string
          monument_id: string | null
          name: string
          rating: number | null
          type: string
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          description?: string | null
          distance?: string | null
          id?: string
          monument_id?: string | null
          name: string
          rating?: number | null
          type: string
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          description?: string | null
          distance?: string | null
          id?: string
          monument_id?: string | null
          name?: string
          rating?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_monument_id_fkey"
            columns: ["monument_id"]
            isOneToOne: false
            referencedRelation: "monuments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
