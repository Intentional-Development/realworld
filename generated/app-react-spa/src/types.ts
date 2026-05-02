// Generated TypeScript types from IDL entities

export interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  body: string;
  author_id: number;
  created_at: any;
  updated_at: any;
  favorites_count: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ArticleTag {
  id: number;
  article_id: number;
  tag_id: number;
}

export interface Favorite {
  id: number;
  user_id: number;
  article_id: number;
}

export interface Comment {
  id: number;
  body: string;
  author_id: number;
  article_id: number;
  created_at: any;
  updated_at: any;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  bio?: string;
  image?: string;
  token?: string;
}

export interface Follow {
  id: number;
  follower_id: number;
  followed_id: number;
}

export interface Profile {
  username: string;
  bio?: string;
  image?: string;
  following: boolean;
}
