export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const USERS_KEY = "ub_users";
const SESSION_KEY = "ub_session";

function getUsers(): Record<string, { password: string; user: AuthUser }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function signUp(name: string, email: string, password: string): AuthUser {
  const users = getUsers();
  const key = email.toLowerCase();
  if (users[key]) throw new Error("An account with this email already exists.");

  const user: AuthUser = {
    id: crypto.randomUUID(),
    name,
    email: key,
    createdAt: new Date().toISOString(),
  };
  users[key] = { password, user };
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logIn(email: string, password: string): AuthUser {
  const users = getUsers();
  const key = email.toLowerCase();
  const record = users[key];
  if (!record) throw new Error("No account found with this email.");
  if (record.password !== password) throw new Error("Incorrect password.");
  localStorage.setItem(SESSION_KEY, JSON.stringify(record.user));
  return record.user;
}

export function logOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Health profile is stored per user id */
export function getHealthProfile(userId: string) {
  try {
    return JSON.parse(localStorage.getItem(`ub_profile_${userId}`) || "null");
  } catch {
    return null;
  }
}

export function saveHealthProfile(userId: string, profile: object) {
  localStorage.setItem(`ub_profile_${userId}`, JSON.stringify(profile));
}
