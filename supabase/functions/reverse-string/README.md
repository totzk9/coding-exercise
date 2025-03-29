# reverse-string

> I named this function `reverse-string` (instead of `reverseString` as suggested in the task description) to follow web standards and API design best practices. Kebab-case is more readable and widely used in URL structures. Supabase maps the function path based on the folder name so I chose correctness and clarity over exact naming.

---

This function takes a string from a query parameter and returns the reversed version of it.

I built this as simple but strict. It looks basic, but I made sure it’s solid under the hood. Everything’s validated and typed, and the goal is to show how a real product API should behave even for small utilities.

---

## How to use it

Just make a `GET` request like this:

```
/functions/v1/reverse-string?text=hello
```

---

## Accepted query parameters

| Key  | Type   | Required | Description                      |
|------|--------|----------|----------------------------------|
| text | string | Yes      | The string you want reversed     |

---

## Example

```
GET /functions/v1/reverse-string?text=This%20is%20a%20text.
```

You’ll get something like:

```json
{
  "original": "This is a text.",
  "reversed": ".txet a si sihT",
  "length": 15
}
```

---

## What I’ll reject

| Status | Message                            | When it happens                                        |
|--------|------------------------------------|--------------------------------------------------------|
| 400    | Invalid or missing 'text'          | The `text` param is empty or missing                   |
| 405    | Method Not Allowed                 | You used POST or anything other than GET               |
| 413    | Input too long                     | You passed in more than 500 characters                 |

---

## Why I built it this way

I know it’s just reversing a string — but this function is meant to show real API quality. Here’s the thinking behind how I wrote it:

### String validation

```ts
if (!isValidText(textParam))
```

It only accepts non-empty strings. That prevents accidental usage like `null`, `123`, `{}`, or anything else that shouldn’t be reversed.

### Max length limit

```ts
if (textParam.length > 500)
```

I added a hard cap of 500 characters because if someone sends in a 1-million character string (possibly an attacker), it could spike CPU usage. This avoids that and keeps the endpoint lightweight.

### Method check

```ts
if (req.method !== "GET")
```

There’s no reason this should support anything other than GET. So I enforce it and return a clear 405 error if misused.

### Structured response

```json
{
  "original": "This is a text.",
  "reversed": ".txet a si sihT",
  "length": 15
}
```

This gives the caller not just the result but context too. It’s helpful when debugging or building UI integrations.

---

## Testing it locally

1. Make sure to follow the Dev Setup in the root folder's README file making use of the `anon key` for the .env file.

2. Start Supabase:
   ```
   supabase start
   ```

3. Serve the function:
   ```
   supabase functions serve reverse-string
   ```

4. Run tests:
   ```
   deno test --allow-env --allow-net --env-file=@app/tests/.env
   ```
   
   or using cURL
   ```
   curl "http://localhost:54321/functions/v1/reverse-string?text=This%20is%20a%20text." \
  -H "Authorization: Bearer ANON_KEY_HERE"
   ```

