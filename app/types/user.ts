export interface User {
  userId: string | null;
  username: string | null;
  token: string | null;
  status: string | null;
  email: string | null;
  bio: string | null;
  avatar: string | null;
  level: string | null;
  isReady?: boolean | null;
}
    