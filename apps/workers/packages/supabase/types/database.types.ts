export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attachment: {
        Row: {
          access_path: string
          bucket_name: string
          chat_id: string
          content_type: string
          created_at: string
          filename: string
          id: string
          original_name: string
          public_url: string | null
          size: number
          storage_path: string
          updated_at: string
          user_id: string
          version: number
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          access_path: string
          bucket_name?: string
          chat_id: string
          content_type: string
          created_at?: string
          filename: string
          id?: string
          original_name: string
          public_url?: string | null
          size: number
          storage_path: string
          updated_at?: string
          user_id: string
          version?: number
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          access_path?: string
          bucket_name?: string
          chat_id?: string
          content_type?: string
          created_at?: string
          filename?: string
          id?: string
          original_name?: string
          public_url?: string | null
          size?: number
          storage_path?: string
          updated_at?: string
          user_id?: string
          version?: number
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: [
          {
            foreignKeyName: "attachment_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
        ]
      }
      chat: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_message_at: string | null
          model: string
          temperature: number | null
          title: string
          updated_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_message_at?: string | null
          model?: string
          temperature?: number | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_message_at?: string | null
          model?: string
          temperature?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      document: {
        Row: {
          content: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["block_kind"]
          title: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["block_kind"]
          title: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["block_kind"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          finish_reason: string | null
          id: string
          parts: Json | null
          role: Database["public"]["Enums"]["message_role"]
          updated_at: string
          usage: Json | null
          user_id: string | null
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          finish_reason?: string | null
          id?: string
          parts?: Json | null
          role: Database["public"]["Enums"]["message_role"]
          updated_at?: string
          usage?: Json | null
          user_id?: string | null
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          finish_reason?: string | null
          id?: string
          parts?: Json | null
          role?: Database["public"]["Enums"]["message_role"]
          updated_at?: string
          usage?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      suggestion: {
        Row: {
          created_at: string
          description: string | null
          document_created_at: string
          document_id: string
          id: string
          is_resolved: boolean
          original_text: string
          suggested_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_created_at: string
          document_id: string
          id?: string
          is_resolved?: boolean
          original_text: string
          suggested_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_created_at?: string
          document_id?: string
          id?: string
          is_resolved?: boolean
          original_text?: string
          suggested_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_document_id_document_created_at_fkey"
            columns: ["document_id", "document_created_at"]
            isOneToOne: false
            referencedRelation: "document"
            referencedColumns: ["id", "created_at"]
          },
          {
            foreignKeyName: "suggestion_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_chat: {
        Row: {
          chat_id: string
          created_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_chat_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorite_chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      vote: {
        Row: {
          chat_id: string
          is_upvoted: boolean
          message_id: string
        }
        Insert: {
          chat_id: string
          is_upvoted: boolean
          message_id: string
        }
        Update: {
          chat_id?: string
          is_upvoted?: boolean
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vote_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vote_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "message"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_api_key: {
        Args: {
          id_of_user: string
          key_description: string
        }
        Returns: undefined
      }
      get_api_key: {
        Args: {
          id_of_user: string
          secret_id: string
        }
        Returns: string
      }
      get_next_attachment_version: {
        Args: {
          p_bucket_name: string
          p_storage_path: string
        }
        Returns: number
      }
      get_user_by_api_key: {
        Args: {
          user_api_key: string
        }
        Returns: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
          website: string | null
        }[]
      }
      is_recent_message: {
        Args: {
          msg_time: string
        }
        Returns: boolean
      }
      load_api_keys: {
        Args: {
          id_of_user: string
        }
        Returns: string[]
      }
      revoke_api_key: {
        Args: {
          id_of_user: string
          secret_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      block_kind: "text" | "image" | "code"
      message_role: "system" | "user" | "assistant" | "data" | "tool"
      visibility_type: "private" | "public" | "team" | "shared" | "unlisted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
