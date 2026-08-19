export interface User {
  id: string;
  google_id: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

export interface Option {
  id: string;
  event_id: string;
  title: string;
  image_url?: string;
  votes_count: number;
  percentage?: number;
}

export type EventStatus = 'upcoming' | 'active' | 'closed';
export type VotingRule = 'single' | 'multiple';

export interface EventItem {
  id: string;
  user_id: string;
  creator_name: string;
  creator_avatar: string;
  title: string;
  description: string;
  image_url: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  status: EventStatus;
  voting_rule: VotingRule;
  options: Option[];
  total_votes: number;
  winning_option_id?: string;
  created_at: string;
}

export interface VoteRecord {
  id: string;
  event_id: string;
  option_id: string;
  user_id: string;
  user_name?: string;
  timestamp: string;
}

export interface VotePayload {
  optionIds: string[]; // for single: 1 id, for multi: 1 or more
  userId: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  image_url: string;
  start_time: string;
  end_time: string;
  voting_rule: VotingRule;
  options: { title: string; image_url?: string }[];
  user_id: string;
}

export type NotificationType = 'event_upcoming' | 'event_closed' | 'vote_received' | 'fcm_system_alert';

export interface NotificationItem {
  id: string;
  user_id: string;
  event_id?: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  data?: {
    event_id?: string;
    event_title?: string;
    winner_option_title?: string;
    winner_option_percentage?: number;
    start_time?: string;
  };
}

export interface FCMDeviceToken {
  token: string;
  user_id: string;
  platform: 'web' | 'android';
  created_at: string;
}
