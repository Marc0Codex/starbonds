// Generated from the Supabase project schema (MCP generate_typescript_types). Do not edit by hand.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      artworks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          images: string[]
          owner_id: string
          title: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          images: string[]
          owner_id: string
          title: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          owner_id?: string
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          a_last_read_at: string
          b_last_read_at: string
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string | null
          user_a: string
          user_b: string
        }
        Insert: {
          a_last_read_at?: string
          b_last_read_at?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          user_a: string
          user_b: string
        }
        Update: {
          a_last_read_at?: string
          b_last_read_at?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          profile_id: string
          role: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          profile_id: string
          role?: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          cover_path: string | null
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          members_count: number
          name: string
          owner_id: string
          slug: string
        }
        Insert: {
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          members_count?: number
          name: string
          owner_id: string
          slug: string
        }
        Update: {
          cover_path?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          members_count?: number
          name?: string
          owner_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          post_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          artwork_id: string | null
          created_at: string
          currency: string
          description: string
          id: string
          images: string[]
          kind: Database["public"]["Enums"]["listing_kind"]
          medium_tag_id: number | null
          price_cents: number
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"]
          stripe_price_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          images?: string[]
          kind: Database["public"]["Enums"]["listing_kind"]
          medium_tag_id?: number | null
          price_cents: number
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          stripe_price_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          artwork_id?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          images?: string[]
          kind?: Database["public"]["Enums"]["listing_kind"]
          medium_tag_id?: number | null
          price_cents?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          stripe_price_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_medium_tag_id_fkey"
            columns: ["medium_tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          user_a: string
          user_b: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          user_a: string
          user_b: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: number
          media_path: string | null
          sender_id: string
        }
        Insert: {
          body?: string
          conversation_id: string
          created_at?: string
          id?: never
          media_path?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: never
          media_path?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string | null
          id: number
          read_at: string | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          id?: never
          read_at?: string | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          id?: never
          read_at?: string | null
          recipient_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          artwork_id: string | null
          author_id: string
          body: string
          comments_count: number
          created_at: string
          group_id: string | null
          id: string
          likes_count: number
          media: string[]
          post_type: Database["public"]["Enums"]["post_type"]
          updated_at: string
        }
        Insert: {
          artwork_id?: string | null
          author_id: string
          body?: string
          comments_count?: number
          created_at?: string
          group_id?: string | null
          id?: string
          likes_count?: number
          media?: string[]
          post_type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Update: {
          artwork_id?: string | null
          author_id?: string
          body?: string
          comments_count?: number
          created_at?: string
          group_id?: string | null
          id?: string
          likes_count?: number
          media?: string[]
          post_type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_tags: {
        Row: {
          profile_id: string
          tag_id: number
        }
        Insert: {
          profile_id: string
          tag_id: number
        }
        Update: {
          profile_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "profile_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string
          display_name: string
          followers_count: number
          following_count: number
          id: string
          links: Json
          locale: string
          location: string | null
          onboarded: boolean
          open_to_collab: boolean
          updated_at: string
          username: string
          website: string | null
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          followers_count?: number
          following_count?: number
          id: string
          links?: Json
          locale?: string
          location?: string | null
          onboarded?: boolean
          open_to_collab?: boolean
          updated_at?: string
          username: string
          website?: string | null
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          followers_count?: number
          following_count?: number
          id?: string
          links?: Json
          locale?: string
          location?: string | null
          onboarded?: boolean
          open_to_collab?: boolean
          updated_at?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: Database["public"]["Enums"]["report_target"]
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["report_target"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          created_at: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          swiper_id: string
          target_id: string
        }
        Insert: {
          created_at?: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          swiper_id: string
          target_id: string
        }
        Update: {
          created_at?: string
          direction?: Database["public"]["Enums"]["swipe_direction"]
          swiper_id?: string
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: number
          kind: Database["public"]["Enums"]["tag_kind"]
          name_en: string
          name_es: string
          slug: string
        }
        Insert: {
          id?: never
          kind: Database["public"]["Enums"]["tag_kind"]
          name_en: string
          name_es: string
          slug: string
        }
        Update: {
          id?: never
          kind?: Database["public"]["Enums"]["tag_kind"]
          name_en?: string
          name_es?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_account: { Args: never; Returns: undefined }
      get_discover_feed: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          artwork_id: string | null
          author_id: string
          body: string
          comments_count: number
          created_at: string
          group_id: string | null
          id: string
          likes_count: number
          media: string[]
          post_type: Database["public"]["Enums"]["post_type"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "posts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_following_feed: {
        Args: { p_before?: string; p_limit?: number }
        Returns: {
          artwork_id: string | null
          author_id: string
          body: string
          comments_count: number
          created_at: string
          group_id: string | null
          id: string
          likes_count: number
          media: string[]
          post_type: Database["public"]["Enums"]["post_type"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "posts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_match_candidates: {
        Args: { p_limit?: number }
        Returns: {
          avatar_path: string
          bio: string
          display_name: string
          followers_count: number
          id: string
          location: string
          score: number
          shared_tag_ids: number[]
          tag_ids: number[]
          username: string
        }[]
      }
      mark_conversation_read: {
        Args: { p_conversation: string }
        Returns: undefined
      }
      start_conversation: {
        Args: { p_listing?: string; p_other: string }
        Returns: string
      }
    }
    Enums: {
      listing_kind: "artwork" | "service"
      listing_status: "active" | "sold" | "hidden"
      notification_type: "like" | "comment" | "follow" | "match" | "group_join"
      post_type: "general" | "collaboration" | "showcase"
      report_target: "profile" | "post" | "comment" | "listing" | "message"
      swipe_direction: "like" | "pass"
      tag_kind: "medium" | "style" | "goal"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      listing_kind: ["artwork", "service"],
      listing_status: ["active", "sold", "hidden"],
      notification_type: ["like", "comment", "follow", "match", "group_join"],
      post_type: ["general", "collaboration", "showcase"],
      report_target: ["profile", "post", "comment", "listing", "message"],
      swipe_direction: ["like", "pass"],
      tag_kind: ["medium", "style", "goal"],
    },
  },
} as const
