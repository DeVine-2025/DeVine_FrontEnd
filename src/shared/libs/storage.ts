const CURRENT_USER_ID_KEY = 'current_user_id';
const USER_ROLE_KEY = 'userRole';
const PROFILE_IMAGE_KEY = 'profile_image_url';

export const getCurrentUserId = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_USER_ID_KEY);
  } catch {
    return null;
  }
};

export const setCurrentUserId = (userId: string | null) => {
  try {
    if (userId) {
      localStorage.setItem(CURRENT_USER_ID_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

export const getUserRoleKey = (userId?: string | null) =>
  userId ? `${USER_ROLE_KEY}:${userId}` : USER_ROLE_KEY;

export const getProfileImageKey = (userId?: string | null) =>
  userId ? `${PROFILE_IMAGE_KEY}:${userId}` : PROFILE_IMAGE_KEY;

export const getStoredUserRole = (userId?: string | null): string | null => {
  const userKey = getUserRoleKey(userId);
  try {
    const stored = localStorage.getItem(userKey);
    if (stored) return stored;
    if (userId) {
      const legacy = localStorage.getItem(getUserRoleKey());
      if (legacy) {
        localStorage.setItem(userKey, legacy);
        return legacy;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
};

export const getStoredProfileImageUrl = (userId?: string | null): string | null => {
  const userKey = getProfileImageKey(userId);
  try {
    const stored = localStorage.getItem(userKey);
    if (stored) return stored;
    if (userId) {
      const legacy = localStorage.getItem(getProfileImageKey());
      if (legacy) {
        localStorage.setItem(userKey, legacy);
        return legacy;
      }
    }
  } catch {
    // ignore storage errors
  }
  return null;
};
