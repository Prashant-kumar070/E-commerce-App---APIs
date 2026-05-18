import { User } from "@/lib/types";

const TOKEN_KEY = "swift_token";
const USER_KEY = "swift_user";

export type StoredAuth = {
  token: string;
  user: User | null;
};

export function getStoredAuth(): StoredAuth {
  if (typeof window === "undefined") {
    return { token: "", user: null };
  }

  const token = localStorage.getItem(TOKEN_KEY) ?? "";
  const rawUser = localStorage.getItem(USER_KEY);
  let user: User | null = null;

  if (rawUser) {
    try {
      user = JSON.parse(rawUser) as User;
    } catch {
      user = null;
    }
  }

  return { token, user };
}

export function persistAuth(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getRoleHomePath(role?: User["role"]) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "seller":
      return "/seller/dashboard";
    case "delivery_person":
      return "/delivery/orders";
    default:
      return "/";
  }
}
