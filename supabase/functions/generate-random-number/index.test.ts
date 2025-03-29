
import { assertEquals } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import {
    ErrorResponse,
    GenerateRandomNumberResponse,
} from "../_utils/test-types.ts";

const baseUrl: string = `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-random-number`;
const ANON_KEY: string | undefined = Deno.env.get("SUPABASE_ANON_KEY");
const defaultHeaders = {
    Authorization: `Bearer ${ANON_KEY}`,
};

Deno.test("returns a random number within default range if no params are given", async () => {
    const res: Response = await fetch(baseUrl, {
        method: "GET",
        headers: defaultHeaders,
    });
    const data: GenerateRandomNumberResponse = await res.json();

    assertEquals(res.status, 200);
    const { min, max, value } = data;
    assertEquals(min, 1);
    assertEquals(max, 100);
    if (value < min || value > max) {
        throw new Error(`Value ${value} is outside the default range.`);
    }
});

Deno.test("returns a random number between provided min and max", async () => {
    const res: Response = await fetch(`${baseUrl}?min=10&max=20`, {
        method: "GET",
        headers: defaultHeaders,
    });
    const data: GenerateRandomNumberResponse = await res.json();

    assertEquals(res.status, 200);
    const { min, max, value } = data;
    assertEquals(min, 10);
    assertEquals(max, 20);
    if (value < 10 || value > 20) {
        throw new Error(`Value ${value} is outside the range 10–20.`);
    }
});

Deno.test("returns 400 for non-integer min and max", async () => {
    const res: Response = await fetch(`${baseUrl}?min=abc&max=50`, {
        method: "GET",
        headers: defaultHeaders,
    });
    const data: ErrorResponse = await res.json();

    assertEquals(res.status, 400);
    assertEquals(data.error, "Invalid query parameters");
});

Deno.test("returns 400 if min is greater than max", async () => {
    const res: Response = await fetch(`${baseUrl}?min=100&max=50`, {
        method: "GET",
        headers: defaultHeaders,
    });
    const data: ErrorResponse = await res.json();

    assertEquals(res.status, 400);
    assertEquals(data.error, "Invalid range");
});

Deno.test("returns 413 if range exceeds the maximum allowed", async () => {
    const res: Response = await fetch(`${baseUrl}?min=0&max=1000001`, {
        method: "GET",
        headers: defaultHeaders,
    });
    const data: ErrorResponse = await res.json();

    assertEquals(res.status, 413);
    assertEquals(data.error, "Range too large");
});

Deno.test("returns 405 for POST request", async () => {
    const res: Response = await fetch(baseUrl, {
        method: "POST",
        headers: defaultHeaders,
    });
    const data: ErrorResponse = await res.json();

    assertEquals(res.status, 405);
    assertEquals(data.error, "Method Not Allowed");
});