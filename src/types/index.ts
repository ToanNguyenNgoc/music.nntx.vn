export interface User {
  id: number;
  email: string;
  fullname: string;
}

export interface AuthContext {
  data: User;
  accessToken: string;
  expiredAt: string;
}

export interface LoginResponse {
  success: boolean;
  context: AuthContext;
  status: number;
  timestamp: string;
  path: string;
}

export interface Music {
  id: number;
  title: string;
  name: string;
  thumbnail: string;
  media_url: string;
  priority: number;
  full_media_url: string;
  created_at: string;
  updated_at: string;
  status: boolean;
}

export interface YoutubeSearchItem {
  channel: string;
  channel_url: string;
  duration: string;
  duration_s: number;
  id: string;
  thumbnail: string;
  title: string;
  upload_date: string;
  url: string;
  views: string;
  views_raw: number;
}

export interface YoutubeSearchResponse {
  success: boolean;
  context: {
    data: YoutubeSearchItem[];
  };
}

export interface YoutubeConvertResponse {
  success: boolean;
  context: {
    job_id: string;
    media_url: string;
    origin_url: string;
    status: string;
    status_url: string;
  };
}

export interface YoutubeConvertStatusResponse {
  success: boolean;
  context: {
    progress: number;
    status: 'downloading' | 'converting' | 'done' | 'failed';
    media_url?: string;
  };
}

export interface ImportMusicRequest {
  title: string;
  name: string;
  thumbnail: string;
  media_url: string;
  priority: number;
}

export interface ProfileData extends User {
  status: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProfileResponse {
  success: boolean;
  context: ProfileData;
  status: number;
  timestamp: string;
  path: string;
}

export interface LogoutResponse {
  success: boolean;
  context: {
    success: boolean;
  };
  status: number;
  timestamp: string;
  path: string;
}

export interface RegisterResponse {
  success: boolean;
  context: AuthContext;
  status: number;
  timestamp: string;
  path: string;
}

export interface DeleteMusicResponse {
  success: boolean;
  context: {
    success: boolean;
  };
  status: number;
  timestamp: string;
  path: string;
}

export interface UpdateMusicResponse {
  success: boolean;
  context: {
    data: Music;
  };
  status: number;
  timestamp: string;
  path: string;
}

export interface RefreshTokenData {
  access_token: string;
  expired_at: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  context: {
    data: RefreshTokenData;
  };
  status: number;
  timestamp: string;
  path: string;
}

export type YoutubeImportStatus = 'idle' | 'converting' | 'importing' | 'imported' | 'failed';
