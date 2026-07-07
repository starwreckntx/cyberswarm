/**
 * Network-scope gate — Layer 1.
 *
 * Enforces CyberSwarm's Rule of Engagement: only authorized RFC1918 networks
 * (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) may be targeted, plus optional engagement
 * CIDRs supplied by the operator. Mirrors KKI's --network-scope gate.
 *
 * IPv4 addresses and CIDRs are checked against the allowlist. Loopback is always allowed
 * (self-test / simulation). Non-IP targets (hostnames/domains, e.g. OSINT) cannot be range
 * -checked in simulation: they are allowed but the trace notes they were not range-verified,
 * unless `strict` is set, in which case any non-RFC1918 / non-IP target is denied.
 */

export const RFC1918_CIDRS: readonly string[] = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"];
const LOOPBACK_CIDR = "127.0.0.0/8";

export interface ScopeDecision {
  allowed: boolean;
  detail: string;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let acc = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    // Reject leading-zero octets: "010" is decimal 10 to Number() but octal 8 to many OS
    // resolvers, so allowing it would let "010.0.0.1" pass the RFC1918 check while the tool
    // targets 8.0.0.1 (a public IP). Octal-IP confusion / scope bypass.
    if (p.length > 1 && p.startsWith("0")) return null;
    const n = Number(p);
    if (n < 0 || n > 255) return null;
    acc = acc * 256 + n;
  }
  return acc >>> 0;
}

function inCidr(ipInt: number, cidr: string): boolean {
  const [base, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const baseInt = ipv4ToInt(base);
  if (baseInt === null || Number.isNaN(bits) || bits < 0 || bits > 32) return false;
  if (bits === 0) return true;
  const mask = bits === 32 ? 0xffffffff : (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

/** The first IPv4 host in a target string ("1.2.3.4", "1.2.3.4/24", "1.2.3.4:80"). */
function extractIpv4(target: string): { ip: string; isCidr: boolean } | null {
  const cidrMatch = target.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (cidrMatch) return { ip: cidrMatch[1], isCidr: true };
  const ipMatch = target.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?$/);
  if (ipMatch) return { ip: ipMatch[1], isCidr: false };
  return null;
}

export class NetworkScope {
  private readonly allowed: string[];
  private readonly strict: boolean;

  constructor(extraCidrs: string[] = [], strict = false) {
    this.allowed = [...RFC1918_CIDRS, LOOPBACK_CIDR, ...extraCidrs];
    this.strict = strict;
  }

  check(target: string | undefined): ScopeDecision {
    if (!target || target.trim() === "") {
      return { allowed: true, detail: "no target (targetless tool)" };
    }
    const parsed = extractIpv4(target);
    if (!parsed) {
      // Hostname / domain — cannot range-check in simulation.
      if (this.strict) {
        return { allowed: false, detail: `strict scope: non-IP target ${JSON.stringify(target)} cannot be range-verified` };
      }
      return { allowed: true, detail: `non-IP target ${JSON.stringify(target)} (not range-verified)` };
    }
    const ipInt = ipv4ToInt(parsed.ip);
    if (ipInt === null) {
      return { allowed: false, detail: `malformed IPv4 ${JSON.stringify(parsed.ip)}` };
    }
    for (const cidr of this.allowed) {
      if (inCidr(ipInt, cidr)) {
        return { allowed: true, detail: `${parsed.ip} in authorized ${cidr}` };
      }
    }
    return { allowed: false, detail: `${parsed.ip} is outside authorized scope (RFC1918 + engagement CIDRs)` };
  }
}
