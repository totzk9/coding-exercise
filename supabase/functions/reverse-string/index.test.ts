import { assertEquals } from 'https://deno.land/std@0.224.0/testing/asserts.ts';
import {
    ReverseStringSuccessResponse,
    ErrorResponse,
} from "../_utils/test-types.ts";

const BASE_URL: string = `${Deno.env.get('SUPABASE_URL')}/functions/v1/reverse-string`;
const ANON_KEY: string | undefined = Deno.env.get('SUPABASE_ANON_KEY');
const DEFAULT_HEADERS = {
    Authorization: `Bearer ${ANON_KEY}`,
};

Deno.test('returns reversed string for valid input', async () => {
    const res: Response = await fetch(`${BASE_URL}?text=This is a text.`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
    });

    const data: ReverseStringSuccessResponse = await res.json();

    assertEquals(res.status, 200);
    assertEquals(data.original, 'This is a text.');
    assertEquals(data.reversed, '.txet a si sihT');
    assertEquals(data.length, 15);
});

Deno.test('returns 400 if "text" parameter is missing', async () => {
    const res: Response = await fetch(BASE_URL, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
    });

    const data: ErrorResponse = await res.json();

    assertEquals(res.status, 400);
    assertEquals(data.error, "Invalid or missing 'text' parameter");
    assertEquals(data.hint, "The 'text' parameter is required and must be a non-empty string.");
});

Deno.test('returns 400 if "text" is empty or just a whitespace', async () => {
    const res: Response = await fetch(`${BASE_URL}?text=   `, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
    });

    const data: ErrorResponse = await res.json();

    assertEquals(res.status, 400);
    assertEquals(data.error, "Invalid or missing 'text' parameter");
});

Deno.test('returns 413 if "text" exceeds maximum length', async () => {
    const longText: string = 'a'.repeat(501);
    const res: Response = await fetch(`${BASE_URL}?text=${longText}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
    });

    const data: ErrorResponse = await res.json();

    assertEquals(res.status, 413);
    assertEquals(data.error, "'text' input is too long");
    assertEquals(data.hint, "The 'text' parameter cannot be longer than 500 characters.");
});

Deno.test('returns 405 for non-GET requests', async () => {
    const res: Response = await fetch(`${BASE_URL}?text=This is a text.`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
    });

    const data: ErrorResponse = await res.json();

    assertEquals(res.status, 405);
    assertEquals(data.error, 'Method not allowed');
    assertEquals(data.hint, 'Only GET requests are allowed.');
});