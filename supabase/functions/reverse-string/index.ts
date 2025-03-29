import { isValidText } from "../_utils/string.ts";
import { SuccessResponse, ErrorResponse } from "../_utils/types.ts";

const MAX_LENGTH: number = 500;

Deno.serve((req: Request): Response => {
  try {
    if (req.method !== 'GET') {
      const errorResponse: ErrorResponse = {
        error: 'Method not allowed',
        status: 405,
        hint: 'Only GET requests are allowed.'
      }
      return new Response(JSON.stringify(errorResponse), {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const url: URL = new URL(req.url);
    const textParam: string | null = url.searchParams.get('text');

    if (!isValidText(textParam)) {
      const errorResponse: ErrorResponse = {
        error: "Invalid or missing 'text' parameter",
        status: 400,
        hint: "The 'text' parameter is required and must be a non-empty string.",
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    if (textParam.length > MAX_LENGTH) { 
      const errorResponse: ErrorResponse = {
        error: "'text' input is too long",
        status: 413,
        hint: `The 'text' parameter cannot be longer than ${MAX_LENGTH} characters.`,
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 413,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const reversed: string = textParam.split('').reverse().join('');

    const successResponse: SuccessResponse<{
      original: string;
      reversed: string;
      length: number;
    }> = {
      original: textParam,
      reversed,
      length: reversed.length,
    };

    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch {
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      status: 500,
      hint: 'Something went wrong. Please try again later.',
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
});