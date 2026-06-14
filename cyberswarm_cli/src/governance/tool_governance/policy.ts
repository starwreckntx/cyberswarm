/**
 * Permission-as-code policy gate — Layer 1.
 *
 * Mirrors KKI's PolicyEngine: classify a tool into a permission level and decide whether it
 * requires human consent. A CyberSwarm SecurityTool is DANGER (danger-full-access) when it
 * is high/critical risk OR requires privilege; such tools never execute without operator
 * consent. Medium-risk tools are workspace-write; low-risk are read-only.
 */
import type { SecurityTool } from "../../types.js";
import {
  Permission,
  PERMISSION_READ_ONLY,
  PERMISSION_WORKSPACE_WRITE,
  PERMISSION_DANGER,
} from "./types.js";

export interface PolicyDecision {
  permission: Permission;
  requiresConsent: boolean;
  detail: string;
}

export function classify(tool: SecurityTool): PolicyDecision {
  const risk = tool.riskLevel;
  const isDanger = risk === "high" || risk === "critical" || tool.requiresPrivilege === true;
  if (isDanger) {
    return {
      permission: PERMISSION_DANGER,
      requiresConsent: true,
      detail: `risk=${risk} requiresPrivilege=${tool.requiresPrivilege} -> danger-full-access (consent required)`,
    };
  }
  if (risk === "medium") {
    return {
      permission: PERMISSION_WORKSPACE_WRITE,
      requiresConsent: false,
      detail: "risk=medium -> workspace-write",
    };
  }
  return {
    permission: PERMISSION_READ_ONLY,
    requiresConsent: false,
    detail: `risk=${risk} -> read-only`,
  };
}
