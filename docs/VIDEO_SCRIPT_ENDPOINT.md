# Video Script Endpoint (Peter & Stewie)

This endpoint generates a **formatted video script** that alternates between Peter and Stewie, with a slight preference for Peter. The output format is exactly:

```
[Stewie - talk]
...
[Stewie - idle]

[Peter - talk]
...
[Peter - idle]
```

---

## Endpoint

```
POST /generate/video-script
```

Base URL (local):
```
http://localhost:8000
```

Full URL:
```
http://localhost:8000/generate/video-script
```

---

## Request Body

```json
{
  "article_title": "Optional short headline",
  "article_text": "Full article text goes here"
}
```

**Fields**
- `article_title` (optional): A short title for context.
- `article_text` (required): The full news article content used to generate the script.

---

## Example cURL

```bash
curl -X POST http://localhost:8000/generate/video-script \
  -H "Content-Type: application/json" \
  -d '{
    "article_title": "Oil prices in Venezuela",
    "article_text": "Venezuela has some of the largest proven oil reserves..."
  }'
```

---

## Example Response

```json
{
  "script_id": "7c6fae61-1e3a-4e31-8a07-2f7b4b6db7e1",
  "script_text": "[Stewie - talk]\nWelcome back...\n[Stewie - idle]\n\n[Peter - talk]\nYeah, and it’s wild...\n[Peter - idle]"
}
```

---

## How to Use It

1) **Collect the article text** you want summarized.
2) **POST to the endpoint** with `article_text` (and optional `article_title`).
3) **Render the response** by parsing `script_text` into alternating speaker blocks.

---

## Troubleshooting

- **500 error**: Ensure `GEMINI_API_KEY` is set in your `.env` and the backend has been restarted.
- **Empty or short output**: Ensure the `article_text` has enough detail for Gemini to generate a multi-turn script.

