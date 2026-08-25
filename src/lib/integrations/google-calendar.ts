import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { env } from "@/lib/env";
import { getSupabaseServiceClient } from "@/lib/supabase/admin";

const GOOGLE_PROVIDER = "google_calendar";

export type CalendarConnection = {
  connected: boolean;
  needsReconnect: boolean;
  calendarId: string | null;
  accountEmail: string | null;
  error: string | null;
};

export type GoogleCalendarEvent = {
  id: string;
  title: string;
  startsAt: string | null;
  endsAt: string | null;
  allDay: boolean;
  htmlLink?: string | null;
  location?: string | null;
};

type AccountRow = {
  calendar_id: string | null;
  account_email: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_expires_at: string | null;
};

function calendarIdOf(account: AccountRow | null) {
  return account?.calendar_id || env.GOOGLE_CALENDAR_ID || "primary";
}

async function loadAccount(): Promise<AccountRow | null> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("integration_accounts")
    .select("calendar_id, account_email, access_token_encrypted, refresh_token_encrypted, token_expires_at")
    .eq("provider", GOOGLE_PROVIDER)
    .maybeSingle();
  return data ?? null;
}

async function saveTokens(update: {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  accountEmail?: string | null;
  calendarId?: string | null;
}) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return;
  const payload: Record<string, unknown> = {
    provider: GOOGLE_PROVIDER,
    access_token_encrypted: encryptSecret(update.accessToken),
    token_expires_at: new Date(Date.now() + (update.expiresIn ?? 3600) * 1000).toISOString(),
  };
  if (update.refreshToken) payload.refresh_token_encrypted = encryptSecret(update.refreshToken);
  if (update.accountEmail !== undefined) payload.account_email = update.accountEmail;
  if (update.calendarId !== undefined) payload.calendar_id = update.calendarId;
  await supabase.from("integration_accounts").upsert(payload, { onConflict: "provider" });
}

async function refreshAccessToken(refreshToken: string) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google Calendar is missing the client ID or secret.");
  }
  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const tokens = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };
  if (!response.ok || !tokens.access_token) {
    throw new Error("Google Calendar access expired. Reconnect the calendar.");
  }
  await saveTokens({ accessToken: tokens.access_token, expiresIn: tokens.expires_in });
  return tokens.access_token;
}

async function getAccessToken(account: AccountRow) {
  if (!account.refresh_token_encrypted) {
    throw new Error("Google Calendar is not connected yet.");
  }
  const refreshToken = decryptSecret(account.refresh_token_encrypted);
  const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : 0;
  if (account.access_token_encrypted && expiresAt - 60_000 > Date.now()) {
    return decryptSecret(account.access_token_encrypted);
  }
  return refreshAccessToken(refreshToken);
}

async function googleFetch(accessToken: string, url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  return response;
}

export async function getCalendarConnection(): Promise<CalendarConnection> {
  const account = await loadAccount();
  if (!account?.refresh_token_encrypted) {
    return {
      connected: false,
      needsReconnect: false,
      calendarId: env.GOOGLE_CALENDAR_ID ?? "primary",
      accountEmail: null,
      error: null,
    };
  }
  try {
    await getAccessToken(account);
    return {
      connected: true,
      needsReconnect: false,
      calendarId: calendarIdOf(account),
      accountEmail: account.account_email,
      error: null,
    };
  } catch (error) {
    return {
      connected: false,
      needsReconnect: true,
      calendarId: calendarIdOf(account),
      accountEmail: account.account_email,
      error: error instanceof Error ? error.message : "Google Calendar needs to be reconnected.",
    };
  }
}

function mapEvent(item: {
  id?: string;
  summary?: string;
  htmlLink?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}): GoogleCalendarEvent | null {
  if (!item.id) return null;
  const allDay = Boolean(item.start?.date && !item.start?.dateTime);
  return {
    id: item.id,
    title: item.summary?.trim() || "(No title)",
    startsAt: item.start?.dateTime ?? item.start?.date ?? null,
    endsAt: item.end?.dateTime ?? item.end?.date ?? null,
    allDay,
    htmlLink: item.htmlLink ?? null,
    location: item.location ?? null,
  };
}

export async function listGoogleCalendarEvents(timeMin: Date, timeMax: Date) {
  const account = await loadAccount();
  if (!account?.refresh_token_encrypted) {
    return { connection: await getCalendarConnection(), events: [] as GoogleCalendarEvent[] };
  }

  const accessToken = await getAccessToken(account);
  const calendarId = encodeURIComponent(calendarIdOf(account));
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });
  const response = await googleFetch(
    accessToken,
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params.toString()}`,
  );
  const payload = (await response.json()) as { items?: Parameters<typeof mapEvent>[0][]; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message || "Could not load Google Calendar events.");
  }
  return {
    connection: {
      connected: true,
      needsReconnect: false,
      calendarId: calendarIdOf(account),
      accountEmail: account.account_email,
      error: null,
    } satisfies CalendarConnection,
    events: (payload.items ?? []).map(mapEvent).filter((event): event is GoogleCalendarEvent => Boolean(event)),
  };
}

export async function lookupGoogleAccountEmail(accessToken: string) {
  const response = await googleFetch(accessToken, "https://www.googleapis.com/calendar/v3/users/me/calendarList");
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    items?: { id?: string; primary?: boolean }[];
  };
  const primary = payload.items?.find((item) => item.primary) ?? payload.items?.[0];
  return primary?.id ?? null;
}

export async function createGoogleCalendarEvent(input: {
  summary: string;
  description?: string;
  startsAt: string;
  endsAt: string;
}) {
  const account = await loadAccount();
  if (!account?.refresh_token_encrypted) return null;
  const accessToken = await getAccessToken(account);
  const calendarId = encodeURIComponent(calendarIdOf(account));
  const response = await googleFetch(
    accessToken,
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: "POST",
      body: JSON.stringify({
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startsAt, timeZone: env.STUDIO_TIMEZONE },
        end: { dateTime: input.endsAt, timeZone: env.STUDIO_TIMEZONE },
      }),
    },
  );
  const payload = (await response.json()) as { id?: string; error?: { message?: string } };
  if (!response.ok || !payload.id) {
    throw new Error(payload.error?.message || "Could not add the session to Google Calendar.");
  }
  return payload.id;
}

export async function deleteGoogleCalendarEvent(eventId: string) {
  const account = await loadAccount();
  if (!account?.refresh_token_encrypted) return;
  const accessToken = await getAccessToken(account);
  const calendarId = encodeURIComponent(calendarIdOf(account));
  const response = await googleFetch(
    accessToken,
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE" },
  );
  if (!response.ok && response.status !== 404 && response.status !== 410) {
    const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(payload.error?.message || "Could not remove the Google Calendar event.");
  }
}

export { saveTokens };
