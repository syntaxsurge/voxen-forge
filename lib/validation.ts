/* -------------------------------------------------------------------------- */
/*                               Basic utilities                              */
/* -------------------------------------------------------------------------- */

export function isNumeric(value: unknown): boolean {
  return typeof value === "string" && /^\d+(\.\d+)?$/.test(value);
}

export function assertRequired(obj: Record<string, any>, keys: string[]): void {
  for (const k of keys) {
    if (obj[k] === undefined || obj[k] === null || obj[k] === "") {
      throw new Error(`Missing required parameter: ${k}`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                            Schema-driven helpers                           */
/* -------------------------------------------------------------------------- */

export type FieldRule = {
  required?: boolean;
  numeric?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
};

export type ValidationSchema = Record<string, FieldRule>;

function validateValue(
  key: string,
  value: any,
  rule: FieldRule,
  errors: string[],
) {
  if (
    rule.required &&
    (value === undefined || value === null || value === "")
  ) {
    errors.push(`Missing required parameter: ${key}`);
    return;
  }
  if (value === undefined || value === null || value === "") return;

  if (rule.numeric && !isNumeric(value)) {
    errors.push(`Parameter ${key} must be numeric`);
  }
  if (rule.regex && !rule.regex.test(value)) {
    errors.push(`Parameter ${key} format is invalid`);
  }
  if (rule.min !== undefined || rule.max !== undefined) {
    const num = Number.parseFloat(value);
    if (Number.isNaN(num)) {
      errors.push(`Parameter ${key} must be numeric`);
    } else {
      if (rule.min !== undefined && num < rule.min)
        errors.push(`Parameter ${key} must be ≥ ${rule.min}`);
      if (rule.max !== undefined && num > rule.max)
        errors.push(`Parameter ${key} must be ≤ ${rule.max}`);
    }
  }
  if (rule.custom && !rule.custom(value)) {
    errors.push(rule.message ?? `Parameter ${key} failed validation`);
  }
}

/**
 * Validate arbitrary data against a schema.
 * Throws an Error on failure; returns typed params on success.
 */
export function validateRequest<T = any>(
  data: Record<string, any>,
  schema: ValidationSchema,
): T {
  const errors: string[] = [];

  for (const [key, rule] of Object.entries(schema)) {
    validateValue(key, data[key], rule, errors);
  }

  if (errors.length) {
    throw new Error(errors.join("; "));
  }
  return data as unknown as T;
}
