/**
 * Positive validation gate — Layer 1.
 *
 * Mirrors KKI's target validation: reject empty/non-string fields and any of the
 * DANGEROUS_CHARS that enable command injection, on every field that could reach a command
 * line (target + option values). Tools are executed by CyberSwarm as simulated calls, never
 * via a shell, but this gate is kept as defense-in-depth so a prompt-injected agent cannot
 * smuggle shell metacharacters through a target or flag.
 */

// `; & | ` $ ( ) < > \ \n { }  plus quotes and newlines.
export const DANGEROUS_CHARS: readonly string[] = [
  ";", "&", "|", "`", "$", "(", ")", "<", ">", "\\", "\n", "\r", "{", "}", "'", '"',
];

export interface ValidationResult {
  valid: boolean;
  detail: string;
}

function scanField(name: string, value: unknown): ValidationResult | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    return { valid: false, detail: `${name} must be a string` };
  }
  for (const ch of DANGEROUS_CHARS) {
    if (value.includes(ch)) {
      const shown = ch === "\n" ? "\\n" : ch === "\r" ? "\\r" : ch;
      return { valid: false, detail: `${name} contains forbidden character '${shown}'` };
    }
  }
  return null;
}

/** Recursively scan a value (string / array / nested object) for forbidden characters. */
function scanValue(name: string, val: unknown): ValidationResult | null {
  if (typeof val === "string") return scanField(name, val);
  if (Array.isArray(val)) {
    for (let i = 0; i < val.length; i++) {
      const check = scanValue(`${name}[${i}]`, val[i]);
      if (check) return check;
    }
  } else if (val !== null && typeof val === "object") {
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const check = scanValue(`${name}.${k}`, v);
      if (check) return check;
    }
  }
  // numbers / booleans / null / undefined cannot carry shell metacharacters.
  return null;
}

/**
 * Validate the target and all option values for injection-class characters. Options are
 * scanned recursively so a payload nested in an array or sub-object (e.g.
 * { custom_args: ["-p", "80; rm -rf /"] }) cannot bypass the gate.
 */
export function validateRequest(target: string | undefined, options: Record<string, unknown> = {}): ValidationResult {
  const targetCheck = scanField("target", target);
  if (targetCheck) return targetCheck;
  for (const [key, val] of Object.entries(options)) {
    const check = scanValue(`option:${key}`, val);
    if (check) return check;
  }
  return { valid: true, detail: "no forbidden characters" };
}
