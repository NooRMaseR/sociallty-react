import { PostProps } from "../components/post";

export const ACCESS: string = "access";
export const REFRESH: string = "refresh";
export const API_URL: string = "http://127.0.0.1:8000";

export interface TokenResponse {
  readonly id: number;
  readonly username: string;
  readonly access: string;
  readonly refresh: string;
}

export interface User {
  readonly id: number;
  readonly username: string;
  readonly profile_picture: string;
}

export interface FullUser {
  readonly id: number;
  readonly username: string;
  readonly profile_picture: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly bio: string;
  readonly birth: string;
  readonly friends_count?: number;
}

export interface UserProfileResponse {
  readonly user: FullUser;
  readonly posts: PostProps[];
  readonly is_friend: boolean;
  readonly has_next: boolean;
}

export enum Visibility {
  public = "public",
  private = "private",
  friends_only = "friends only",
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

