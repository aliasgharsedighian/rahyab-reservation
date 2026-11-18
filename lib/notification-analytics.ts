import { logInappEvent } from "./analytics";
import { createAnalyticsId } from "./analytics-errors";
import { getAnalyticsIdentity } from "./auth-analytics";

export function createMessageDisplay(notificationId: number) {
  return {
    messageId: `msg_${notificationId}`,
    context: null as {
      messageId: string;
      displayId: string;
      identity: ReturnType<typeof getAnalyticsIdentity>;
    } | null,
    dismissed: false,
  };
}

export type MessageDisplay = ReturnType<typeof createMessageDisplay>;

export function recordMessageShown(display: MessageDisplay) {
  if (display.context) return;
  try {
    display.context = {
      messageId: display.messageId,
      displayId: createAnalyticsId(),
      identity: getAnalyticsIdentity(null),
    };
    logInappEvent("inapp_message_shown", display.context);
  } catch {
    console.warn("Analytics could not record the message display.");
  }
}

export function recordMessageInteraction(display: MessageDisplay, action: "clicked" | "dismissed") {
  if (!display.context || display.dismissed) return;
  if (action === "dismissed") display.dismissed = true;
  logInappEvent(action === "clicked" ? "inapp_message_clicked" : "inapp_message_dismissed", display.context);
}
