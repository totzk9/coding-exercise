# generate-random-number

This function returns a random integer between two values you give me: `min` and `max`.

I built this to be as strict and safe as possible — not just for correctness, but also to keep things stable and predictable in real-world use cases. Everything is typed, validated, and guarded with constraints that make sense for a production-level API.

---

## How to use it

You send me a `GET` request like this:

```
/functions/v1/generate-random-number?min=10&max=100
```

---

## Accepted query parameters

| Key   | Type   | Required | Description                                     |
|-------|--------|----------|-------------------------------------------------|
| min   | number | No       | Lower bound of the range. Defaults to 1.        |
| max   | number | No       | Upper bound of the range. Defaults to 100.      |

---

## Example

```
GET /functions/v1/generate-random-number?min=5&max=15
```

You’ll get something like:

```json
{
  "min": 5,
  "max": 15,
  "value": 9
}
```

---

## What I’ll reject

| Status | Message                    | When it happens                                                            |
|--------|----------------------------|----------------------------------------------------------------------------|
| 400    | Invalid query parameters   | You passed a non-integer as `min` or `max`                                 |
| 400    | Invalid range              | `min` is greater than `max`                                                |
| 413    | Range too large            | The difference between `max` and `min` is larger than what I allow         |
| 405    | Method Not Allowed         | You used POST or something else instead of GET                             |

---

## Why I built it this way

I added a bunch of guards and structure so this won’t break.

### Range limit

```ts
if (max - min > MAX_ALLOWED)
```

This avoids a huge range that could cause performance issues (e.g., `min=1&max=9999999999`). I capped the max difference at 1,000,000 because anything more than that is unnecessary for most use cases and just wastes CPU.

### Integer enforcement

```ts
parseInt(minParam)
```

No floats. This ensures what you're passing in can be safely used for random number generation.

### GET only

This keeps the function simple. There's no need for a POST request just to get a number.

### Consistent response format

```json
{
  "min": 10,
  "max": 20,
  "value": 14
}
```

---

## Testing it locally

1. Make sure to follow the Dev Setup in the root folder's README file making use of the `anon key` for the .env file.

1. Start Supabase:
   ```
   supabase start
   ```

2. Serve the function:
   ```
   supabase functions serve generate-random-number
   ```

3. Run tests:
   ```
   deno test --allow-env --allow-net --env-file=@app/tests/.env
   ```
      or using cURL
   ```
   curl "http://localhost:54321/functions/v1/generate-random-number?min=5&max=15" \
  -H "Authorization: Bearer ANON_KEY_HERE"
   ```