export async function register() {
  // This machine has no working IPv6 egress, but DNS often returns AAAA (IPv6)
  // records first. Node's fetch/undici (used by Resend and the WhatsApp proxy)
  // then tries the dead IPv6 route and fails with "fetch failed" / ETIMEDOUT.
  // Forcing IPv4-first resolution makes outbound fetch use the reachable route.
  // NODE_OPTIONS=--dns-result-order does not reliably reach the Turbopack dev
  // server worker, so we set it programmatically at server startup instead.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dns = await import("node:dns")
    dns.setDefaultResultOrder("ipv4first")
  }
}
