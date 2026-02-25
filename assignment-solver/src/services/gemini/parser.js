/**
 * @fileoverview Gemini API response parser utility
 */

/**
 * Parse Gemini API response
 * @param {Object} response - Gemini API response
 * @returns {Object} Parsed result
 * @throws {Error} If response cannot be parsed
 */
export function parseGeminiResponse(response) {
  // Check for blocked or empty responses
  const candidate = response?.candidates?.[0];
  if (!candidate) {
    const blockReason = response?.promptFeedback?.blockReason;
    if (blockReason) {
      throw new Error(`Gemini blocked the request: ${blockReason}`);
    }
    throw new Error("No candidates in Gemini response");
  }

  const finishReason = candidate.finishReason;
  if (finishReason && finishReason !== "STOP") {
    console.warn(
      `[Parser] Gemini finish reason: ${finishReason} (may indicate truncated or blocked output)`,
    );
  }

  try {
    const parts = candidate.content?.parts || [];
    const content = parts
      .map((part) => part?.text)
      .filter(Boolean)
      .join("\n");

    if (!content || !content.trim()) {
      throw new Error(
        `Empty text in Gemini response (finishReason: ${finishReason || "unknown"})`,
      );
    }

    const trimmed = content.trim();

    // Attempt 1: Direct JSON parse
    try {
      return JSON.parse(trimmed);
    } catch (_) {
      // fall through
    }

    // Attempt 2: Extract from fenced code block
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fencedMatch) {
      try {
        return JSON.parse(fencedMatch[1].trim());
      } catch (_) {
        // fall through
      }
    }

    // Attempt 3: Find outermost JSON delimiters
    const candidate2 = fencedMatch ? fencedMatch[1].trim() : trimmed;
    const firstBrace = candidate2.indexOf("{");
    const lastBrace = candidate2.lastIndexOf("}");
    const firstBracket = candidate2.indexOf("[");
    const lastBracket = candidate2.lastIndexOf("]");

    let jsonSlice = null;
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonSlice = candidate2.slice(firstBrace, lastBrace + 1);
    } else if (
      firstBracket !== -1 &&
      lastBracket !== -1 &&
      lastBracket > firstBracket
    ) {
      jsonSlice = candidate2.slice(firstBracket, lastBracket + 1);
    }

    if (jsonSlice) {
      try {
        return JSON.parse(jsonSlice);
      } catch (_) {
        // fall through
      }
    }

    // Attempt 4: Try to repair truncated JSON (missing closing braces/brackets)
    if (finishReason === "MAX_TOKENS" && jsonSlice) {
      const repaired = repairTruncatedJson(jsonSlice);
      if (repaired) {
        return repaired;
      }
    }

    throw new Error(
      `Could not extract valid JSON (finishReason: ${finishReason || "unknown"}, textLength: ${trimmed.length})`,
    );
  } catch (e) {
    console.error("Failed to parse Gemini response:", e.message);
    throw new Error("Failed to parse Gemini response: " + e.message);
  }
}

/**
 * Attempt to repair truncated JSON by closing open braces/brackets
 * @param {string} json - Truncated JSON string
 * @returns {Object|null} Parsed object or null if unrepairable
 */
function repairTruncatedJson(json) {
  try {
    // Count open vs close braces and brackets
    let braces = 0;
    let brackets = 0;
    let inString = false;
    let escape = false;

    for (const ch of json) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (ch === "{") braces++;
      else if (ch === "}") braces--;
      else if (ch === "[") brackets++;
      else if (ch === "]") brackets--;
    }

    // If we're inside a string, close it
    let repaired = json;
    if (inString) {
      repaired += '"';
    }

    // Close open brackets then braces
    repaired += "]".repeat(Math.max(0, brackets));
    repaired += "}".repeat(Math.max(0, braces));

    return JSON.parse(repaired);
  } catch (_) {
    return null;
  }
}
