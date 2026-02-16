/**
 * Helper function to access nested field values from DatoCMS formValues
 * Handles both top-level and nested (block/model) fields
 *
 * @param formValues - The ctx.formValues object from DatoCMS
 * @param fieldPath - The ctx.fieldPath string (e.g., "schedule" or "storeService.schedule")
 * @returns The field value, or undefined if not found
 *
 * Examples:
 * - Top-level: getNestedFieldValue(formValues, "schedule") → formValues["schedule"]
 * - Nested: getNestedFieldValue(formValues, "storeService.schedule") → formValues["storeService"]["schedule"]
 */
export function getNestedFieldValue(formValues: any, fieldPath: string): any {
	if (!fieldPath) return undefined;

	// Split by dot notation for nested paths
	const keys = fieldPath.split(".");
	let value = formValues;

	for (const key of keys) {
		if (value == null) return undefined;
		value = value[key];
	}

	return value;
}

/**
 * Alternative approach: Use lodash-style get with fallback
 * Provides deeper debugging info
 */
export function getNestedFieldValueWithDebug(
	formValues: any,
	fieldPath: string,
	debug = false
): any {
	if (!fieldPath) {
		if (debug) console.warn("[getNestedFieldValue] fieldPath is empty");
		return undefined;
	}

	const keys = fieldPath.split(".");
	let value = formValues;
	let currentPath = "";

	for (const key of keys) {
		currentPath = currentPath ? `${currentPath}.${key}` : key;

		if (value == null) {
			if (debug)
				console.warn(
					`[getNestedFieldValue] Cannot access key "${key}" at path "${currentPath}" - value is null/undefined`
				);
			return undefined;
		}

		if (!(key in value)) {
			if (debug) {
				console.warn(
					`[getNestedFieldValue] Key "${key}" not found in object at path "${currentPath}"`
				);
				console.debug(
					`[getNestedFieldValue] Available keys at "${currentPath.split(".").slice(0, -1).join(".") || "root"}":`,
					Object.keys(value)
				);
			}
			return undefined;
		}

		value = value[key];
	}

	if (debug) console.debug(`[getNestedFieldValue] Successfully retrieved value at path "${fieldPath}":`, value);
	return value;
}
