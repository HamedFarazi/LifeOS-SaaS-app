/**
 * Default logo URLs for known services.
 * Key = service id (from seed.ts) OR service name (lowercase, trimmed).
 * Value = URL to an image (https or /public path).
 *
 * To add a logo:
 *   1. Put the image in /public/logos/  (e.g. netflix.png)
 *   2. Add an entry: 'svc-netflix': '/logos/netflix.png'
 *      OR by name: 'netflix': '/logos/netflix.png'
 */
export const SERVICE_LOGOS: Record<string, string> = {
  // ── By service id (exact match from seed.ts) ──────────────────────
  "svc-chatgpt": "/logos/chatgpt.jpg",
  "svc-netflix": "/logos/netflix.jpg",
  "svc-spotify": "/logos/spotify.jpg",
  "svc-prime": "/logos/prime.jpg",
  "svc-copilot": "/logos/copilot.jpg",
  "svc-adobe": "/logos/adobe.jpg",
  "svc-domain-ir": "/logos/ir.jpg",
  "svc-domain-com": "/logos/com.jpg",
  "svc-hosting": "/logos/hosting.jpg",
  "svc-ssl": "/logos/ssl.jpg",
  "svc-vpn": "/logos/vpn.jpg",
  "svc-internet": "/logos/internet.jpg",
  "svc-gym": "/logos/gym.jpg",

  // ── By service name (lowercase fallback) ──────────────────────────
  "chatgpt plus": "",
  netflix: "",
  spotify: "",
  "prime video": "",
  "github copilot": "",
  "adobe cc": "",
  "example.ir": "",
  "trackly.com": "",
};

/**
 * Returns the logo URL for a service, or undefined if not set.
 * Checks by id first, then by lowercase name.
 */
export function getServiceLogo(id: string, name: string): string | undefined {
  const byId = SERVICE_LOGOS[id];
  if (byId) return byId;
  const byName = SERVICE_LOGOS[name.toLowerCase().trim()];
  if (byName) return byName;
  return undefined;
}
