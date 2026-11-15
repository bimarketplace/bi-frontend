"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { Notification01Icon } from "hugeicons-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAuthErrorMessage } from "@/lib/auth";

type PushState = "checking" | "enabled" | "disabled" | "blocked" | "unsupported";

const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_URL || "https://bi-backend-1tf6.onrender.com"
).replace(/\/+$/, "");

const isIOSDevice = () =>
    typeof navigator !== "undefined" &&
    (/iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

const isInstalledPWA = () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true);

const supportsWebPush = () =>
    typeof window !== "undefined" &&
    "Notification" in window &&
    "PushManager" in window &&
    "serviceWorker" in navigator &&
    (!isIOSDevice() || isInstalledPWA());

const getReadyServiceWorker = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
        throw new Error("Message notifications require the app's service worker. Please try again after the app finishes loading.");
    }

    return navigator.serviceWorker.ready;
};

const decodeVapidPublicKey = (key: string) => {
    const paddedKey = key.padEnd(Math.ceil(key.length / 4) * 4, "=");
    const base64Key = paddedKey.replace(/-/g, "+").replace(/_/g, "/");
    const rawKey = window.atob(base64Key);

    return Uint8Array.from(rawKey, (character) => character.charCodeAt(0));
};

const registerSubscription = async (
    subscription: PushSubscription,
    accessToken: string,
) => {
    const json = subscription.toJSON();
    if (!json.keys?.p256dh || !json.keys.auth) {
        throw new Error("The browser returned an incomplete push subscription.");
    }

    await axios.post(
        `${API_BASE_URL}/api/push/subscriptions/`,
        {
            endpoint: subscription.endpoint,
            keys: json.keys,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } },
    );
};

export default function MessagePushNotifications({
    compact = false,
}: {
    compact?: boolean;
}) {
    const { data: session, status: sessionStatus } = useSession();
    const accessToken = session?.access_token;
    const [pushState, setPushState] = useState<PushState>("checking");
    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        if (sessionStatus === "loading" || !accessToken) return;

        let isActive = true;
        const syncSubscription = async () => {
            await Promise.resolve();
            if (!supportsWebPush()) {
                if (isActive) setPushState("unsupported");
                return;
            }

            try {
                if (Notification.permission === "denied") {
                    if (isActive) setPushState("blocked");
                    return;
                }

                const registration = await navigator.serviceWorker.getRegistration();
                if (!registration) {
                    if (isActive) setPushState("disabled");
                    return;
                }

                const subscription = await registration.pushManager.getSubscription();
                if (!subscription || Notification.permission !== "granted") {
                    if (isActive) setPushState("disabled");
                    return;
                }

                await registerSubscription(subscription, accessToken);
                if (isActive) setPushState("enabled");
            } catch (error) {
                console.error("Could not restore message push subscription", error);
                if (isActive) setPushState("disabled");
            }
        };

        void syncSubscription();
        return () => {
            isActive = false;
        };
    }, [accessToken, sessionStatus]);

    if (sessionStatus !== "authenticated" || !accessToken) return null;

    if (pushState === "unsupported") {
        const message = isIOSDevice() && !isInstalledPWA()
            ? "Add BI Marketplace to your Home Screen to enable notifications on iPhone or iPad."
            : "Push notifications are unavailable in this browser.";
        return <span className="text-xs text-zinc-500" title={message}>Push unavailable</span>;
    }

    const handleClick = async () => {
        if (pushState === "blocked") {
            toast.error("Notifications are blocked. Allow them in your browser or phone settings.");
            return;
        }

        setIsBusy(true);
        try {
            if (pushState === "enabled") {
                const registration = await getReadyServiceWorker();
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await axios.delete(`${API_BASE_URL}/api/push/subscriptions/`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        data: { endpoint: subscription.endpoint },
                    });
                    await subscription.unsubscribe();
                }
                setPushState("disabled");
                toast.success("Message notifications turned off");
                return;
            }

            const permission = Notification.permission === "granted"
                ? "granted"
                : await Notification.requestPermission();
            if (permission !== "granted") {
                setPushState(permission === "denied" ? "blocked" : "disabled");
                if (permission === "denied") {
                    toast.error("Notifications are blocked. Allow them in your browser or phone settings.");
                }
                return;
            }

            const registration = await getReadyServiceWorker();
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
                const response = await axios.get<{ public_key: string }>(
                    `${API_BASE_URL}/api/push/vapid-public-key/`,
                );
                if (!response.data.public_key) {
                    throw new Error("The push notification server did not provide a public key.");
                }
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: decodeVapidPublicKey(response.data.public_key),
                });
            }

            await registerSubscription(subscription, accessToken);
            setPushState("enabled");
            toast.success("Message notifications enabled");
        } catch (error) {
            console.error("Could not update message push subscription", error);
            const message = axios.isAxiosError(error)
                ? getAuthErrorMessage(error, "Could not update notification settings. Please try again.")
                : error instanceof Error
                    ? error.message
                    : "Could not update notification settings. Please try again.";
            toast.error(message);
        } finally {
            setIsBusy(false);
        }
    };

    const label = pushState === "enabled" ? "Alerts on" : "Enable alerts";

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isBusy || pushState === "checking"}
            aria-label={pushState === "enabled" ? "Turn off message notifications" : "Enable message notifications"}
            aria-pressed={pushState === "enabled"}
            title={pushState === "enabled" ? "Turn off message notifications" : "Enable message notifications"}
            className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                pushState === "enabled"
                    ? "bg-green-50 text-[#008000]"
                    : "text-zinc-600 hover:bg-zinc-100"
            }`}
        >
            <Notification01Icon size={18} />
            {!compact && <span>{isBusy ? "Saving..." : label}</span>}
        </button>
    );
}
