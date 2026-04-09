interface PushSubscriptionJson {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotifier {
  private static __registration: ServiceWorkerRegistration | null = null;
  private static __vapidKey: string | null = null;

  private static async __getVapidKey(): Promise<string> {
    if (PushNotifier.__vapidKey) return PushNotifier.__vapidKey;

    const result = await Api.Queries.vapidPublicKey();
    PushNotifier.__vapidKey = result.vapidPublicKey;
    return PushNotifier.__vapidKey!;
  }

  private static async __getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!navigator.serviceWorker) return null;

    if (PushNotifier.__registration) return PushNotifier.__registration;

    try {
      PushNotifier.__registration = await navigator.serviceWorker.register("sw.js");
      return PushNotifier.__registration;
    } catch (err) {
      console.error("Service worker registration failed:", err);
      return null;
    }
  }

  public static async subscribe(): Promise<boolean> {
    const registration = await PushNotifier.__getRegistration();
    if (!registration) {
      console.error("No service worker registration");
      return false;
    }

    try {
      const vapidKey = await PushNotifier.__getVapidKey();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: PushNotifier.__urlBase64ToUint8Array(vapidKey),
      });

      const subJson = subscription.toJSON() as PushSubscriptionJson;
      await Api.Mutations.subscribePush(
        subJson.endpoint,
        subJson.keys.p256dh,
        subJson.keys.auth
      );

      return true;
    } catch (err) {
      console.error("Failed to subscribe to push:", err);
      return false;
    }
  }

  public static async unsubscribe(): Promise<boolean> {
    const registration = await PushNotifier.__getRegistration();
    if (!registration) return false;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return true;

      const subJson = subscription.toJSON() as PushSubscriptionJson;
      await Api.Mutations.unsubscribePush(subJson.endpoint);
      await subscription.unsubscribe();
      return true;
    } catch (err) {
      console.error("Failed to unsubscribe from push:", err);
      return false;
    }
  }

  public static async isSubscribed(): Promise<boolean> {
    const registration = await PushNotifier.__getRegistration();
    if (!registration) return false;

    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  }

  private static __urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}
