using System.Text.Json;
using WebPush;

namespace Backend.Services;

public class PushSubscription
{
    public string Endpoint { get; set; } = string.Empty;
    public string P256dh { get; set; } = string.Empty;
    public string Auth { get; set; } = string.Empty;
}

public class PushNotificationPayload
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? Icon { get; set; }
}

public class PushService
{
    private readonly List<PushSubscription> _subscriptions = new();
    private readonly string _vapidPublicKey;
    private readonly string _vapidPrivateKey;
    private readonly string _subject;

    public PushService()
    {
        _vapidPublicKey = Environment.GetEnvironmentVariable("VAPID_PUBLIC_KEY") ?? "BLS-PBo4HceaemD_Wjcy0b9o1yaz_LSKTxiaZONTVmm-GavqSbEiSci4opr8JLHcn1-QoG_jWEjz0s8AsqwszhM";
        _vapidPrivateKey = Environment.GetEnvironmentVariable("VAPID_PRIVATE_KEY") ?? "XLXVr_X4Wm4Q9zhLz8asWsMPhFM2Xmsx2FevnpRmL_Q";
        _subject = Environment.GetEnvironmentVariable("VAPID_SUBJECT") ?? "mailto:admin@class-scheduler.local";
    }

    public string GetVapidPublicKey() => _vapidPublicKey;

    public void Subscribe(PushSubscription subscription)
    {
        var existing = _subscriptions.FirstOrDefault(s => s.Endpoint == subscription.Endpoint);
        if (existing == null)
        {
            _subscriptions.Add(subscription);
        }
    }

    public void Unsubscribe(string endpoint)
    {
        var subscription = _subscriptions.FirstOrDefault(s => s.Endpoint == endpoint);
        if (subscription != null)
        {
            _subscriptions.Remove(subscription);
        }
    }

    public async Task SendNotificationAsync(string title, string body)
    {
        var vapidKeys = new VapidDetails(_subject, _vapidPublicKey, _vapidPrivateKey);
        var payload = JsonSerializer.Serialize(new PushNotificationPayload
        {
            Title = title,
            Body = body,
            Icon = "/icon.png"
        });

        foreach (var subscription in _subscriptions.ToList())
        {
            try
            {
                var pushSubscription = new WebPush.PushSubscription
                {
                    Endpoint = subscription.Endpoint,
                    P256DH = subscription.P256dh,
                    Auth = subscription.Auth
                };

                var webPushClient = new WebPushClient();
                webPushClient.SendNotification(pushSubscription, payload, vapidKeys);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending push notification: {ex.Message}");
                if (ex.Message.Contains("410") || ex.Message.Contains("gone"))
                {
                    _subscriptions.Remove(subscription);
                }
            }
        }
    }
}
