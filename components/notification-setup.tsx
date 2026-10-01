"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function NotificationSetup() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function enableNotifications() {
    setBusy(true);
    setMessage("");

    try {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error("Web Push is not configured yet: NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing.");
      }

      if (!("Notification" in window)) {
        throw new Error("This browser does not support notifications.");
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("This browser does not support Web Push.");
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission was not granted.");
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const json = subscription.toJSON();
      const endpoint = subscription.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;

      if (!p256dh || !auth) {
        throw new Error("The browser returned an incomplete Web Push subscription.");
      }

      const supabase = getSupabaseClient();
      const { error } = await supabase.functions.invoke("register-notification-device", {
        body: {
          device_type: "web",
          push_provider: "web_push",
          push_token: endpoint,
          push_endpoint: endpoint,
          push_p256dh: p256dh,
          push_auth: auth,
        },
      });

      if (error) throw new Error(error.message);

      setMessage("Notifications are enabled on this browser.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-medium">Notifications</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Enable this browser to receive academic reminders and alerts.
          </p>
          {message && <p className="mt-2 text-sm text-zinc-400">{message}</p>}
        </div>
        <button
          type="button"
          onClick={() => void enableNotifications()}
          disabled={busy}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
        >
          {busy ? "Enabling..." : "Enable notifications"}
        </button>
      </div>
    </section>
  );
}
