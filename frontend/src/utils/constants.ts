import { Media, PostProps } from "../components/post";

export const DEBUG: boolean = false;
const USELOCAL: boolean = false;
const LOCAL_URL = "http://127.0.0.1:8000";
export const ACCESS = "access";
export const REFRESH = "refresh";
export const API_URL = DEBUG ? USELOCAL ? LOCAL_URL : "http://192.168.1.8:8000" : "https://successful-carlene-noormaser-5d3a002e.koyeb.app";
export const MEDIA_URL = DEBUG ? USELOCAL ? LOCAL_URL : "http://192.168.1.8:8000" : '';
export const WEBSOCKET_URL = DEBUG ? USELOCAL ? `${LOCAL_URL}/ws` : "ws://192.168.1.8:8000/ws" : `wss://successful-carlene-noormaser-5d3a002e.koyeb.app/ws`;
export const AR: string[] = ["إ", 'أ', 'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي', 'ى' , 'ء'];

export interface TokenResponse {
  readonly id: number;
  readonly username: string;
  readonly profile_picture: string;
  readonly access: string;
  readonly refresh: string;
}

export interface User {
  readonly id: number;
  readonly username: string;
  readonly profile_picture: string;
  readonly gender: "male" | "female";
  readonly bio?: string;
}

export interface UserSettings {
  is_private_account: boolean;
}

export interface FullUser extends User {
  readonly email?: string;
  readonly password?: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly birth: string;
  readonly phone?: string;
  readonly friends_count?: number;
  settings?: UserSettings;
}

export interface UserProfileResponse {
  readonly user: FullUser;
  readonly posts: PostProps[];
  readonly is_friend: boolean;
  readonly has_request: boolean;
  readonly has_next: boolean;
}

export enum Visibility {
  public = "public",
  private = "private",
  friends_only = "friends only",
}

export enum ApiUrls {
  user_log_sign = "user/",
  api = "api/",
  chat = "chat/",
  messageReact = `${chat}message-react/`,
  user_refresh_token = `${user_log_sign}refresh/`,
  user_requests_count = `${user_log_sign}recive-requests/`,
  see_user_friends = "see-user-friends/?list=",
  see_friends_requests = 'see-friends-request/',
  edit_user = `${user_log_sign}edit-user/`,
  forget_password = `${user_log_sign}forget-password/`,
  settings = `${user_log_sign}settings/`,
  posts_today = "today-posts/?page=",
  post = `${api}post/`,
  post_edit = "post-edit/",
  add_post_like = `${api}add-post-like/`,
  post_comment = `${api}post-comment/`,
  add_comment_like = `${api}add-comment-like/`,
  social_users = "social-users/",
  report = `${api}report-user/`,
}

export interface PostFormProps {
  files: File[];
  desc: string;
  visibility: Visibility;
}

export interface CommentProps {
  readonly id: number;
  readonly user: User;
  readonly created_at: string;
  content: string;
  comment_likes: number;
}

// store data types

export type HasTokenStateType = {
  hasToken: {
    value: boolean;
  };
};

export type PostsStateType = {
  postsState: {
    value: PostProps[];
  };
};

export type commentSliderType = {
  comment_slider_state: {
    last_post_id: number;
    value: boolean;
  };
};

export type BottomSheetStateType = {
  bottomSheetState: {
    last_post_id: number;
    open: boolean;
  };
};

export type CurrentActiveRouteStateType = {
  current_active_route: {
    value: string;
  };
};

export type BackBgStateType = {
  back_bg_state: {
    value: boolean;
  };
};

export type PostContentSliderStateType = {
  post_content_slider: {
    value: boolean;
    media: Media[];
  };
};

export type FriendsRequestsCountStateType = {
  friends_requests_count: {
    count: number;
  };
};

export const reactionsEmojis = {
  like: "👍",
  dislike: "👎",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠",
  cool: "😎",
};