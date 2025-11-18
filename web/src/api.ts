import { auth, FUNCTIONS_BASE_URL } from './firebase';
import { HolidayConfig, MessagePayload } from './types';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  return await user.getIdToken();
}

export async function getRemoteConfig(): Promise<HolidayConfig[]> {
  const token = await getAuthToken();
  const response = await fetch(`${FUNCTIONS_BASE_URL}/getRemoteConfig`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get remote config');
  }

  const result = await response.json();
  return result.data;
}

export async function updateRemoteConfig(configArray: HolidayConfig[]): Promise<void> {
  const token = await getAuthToken();
  const response = await fetch(`${FUNCTIONS_BASE_URL}/updateRemoteConfig`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ configArray }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update remote config');
  }
}

export async function sendMessage(message: MessagePayload): Promise<string> {
  const token = await getAuthToken();
  const response = await fetch(`${FUNCTIONS_BASE_URL}/sendMessage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  const result = await response.json();
  return result.messageId;
}
