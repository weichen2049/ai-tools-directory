type TelemetryPayload = {
  component: string;
  endpoint?: string;
  message: string;
  extra?: Record<string, unknown>;
};

const TELEMETRY_ENDPOINT = "/api/telemetry";

export async function captureClientError(payload: TelemetryPayload) {
  try {
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([JSON.stringify({ ...payload, type: "error" })], {
        type: "application/json"
      });
      navigator.sendBeacon(TELEMETRY_ENDPOINT, blob);
      return;
    }

    await fetch(TELEMETRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, type: "error" }),
      keepalive: true
    });
  } catch (error) {
    console.error("[Telemetry]", error);
  }
}