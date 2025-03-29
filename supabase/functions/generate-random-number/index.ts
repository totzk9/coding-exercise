import { ErrorResponse, SuccessResponse } from "../_utils/types.ts";

const DEFAULT_MIN: number = 1;
const DEFAULT_MAX: number = 100;
const MAX_ALLOWED: number = 1_000_000;

Deno.serve((req: Request): Response => {
  try {
    if (req.method !== "GET") {
      const errorResponse: ErrorResponse = {
        error: "Method Not Allowed",
        status: 405,
        hint: "Use GET method to call this function.",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url: URL = new URL(req.url);
    const minParam: string | null = url.searchParams.get("min");
    const maxParam: string | null = url.searchParams.get("max");

    const min: number = minParam ? parseInt(minParam) : DEFAULT_MIN;
    const max: number = maxParam ? parseInt(maxParam) : DEFAULT_MAX;

    if (Number.isNaN(min) || Number.isNaN(max)) {
      const errorResponse: ErrorResponse = {
        error: "Invalid query parameters",
        status: 400,
        hint: "`min` and `max` must be valid integers.",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (min > max) {
      const errorResponse: ErrorResponse = {
        error: "Invalid range",
        status: 400,
        hint: "`min` must be less than `max`.",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (max - min > MAX_ALLOWED) {
      const errorResponse: ErrorResponse = {
        error: "Range too large",
        status: 413,
        hint: `The difference between 'max' and 'min' must not exceed ${MAX_ALLOWED}.`,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    const random: number = Math.floor(Math.random() * (max - min + 1)) + min;

    const successResponse: SuccessResponse<{
      min: number;
      max: number;
      value: number;
    }> = {
      min,
      max,
      value: random,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    const errorResponse: ErrorResponse = {
      error: "Internal Server Error",
      status: 500,
      hint: "Please try again later.",
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});