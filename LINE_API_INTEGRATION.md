# LINE Messaging API Integration Guide

This document contains the essential API configurations and functions extracted from the LINE Bot implementation for reuse in other projects.

## Environment Variables Required

```bash
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_access_token_here
BASE_URL=your_base_api_url_here
KV=your_kv_namespace_binding
```

## Core Functions

### 1. Signature Verification Function

```javascript
/**
 * Verifies the HMAC-SHA256 signature from LINE
 */
async function verifySignature(body, signature, secret) {
  if (!secret) {
    console.error("LINE_CHANNEL_SECRET is not set in environment variables.");
    return false;
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const bodyData = encoder.encode(body);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign("HMAC", key, bodyData);
  const base64Mac = btoa(String.fromCharCode(...new Uint8Array(mac)));

  return base64Mac === signature;
}
```

### 2. Event Handler Router

```javascript
/**
 * Routes events to specific handlers
 */
async function handleEvent(event, env) {
  console.log(`Received event type: ${event.type}`);

  switch (event.type) {
    case "message":
      if (event.message.type === "text") {
        return handleTextMessage(event, env);
      }
      break;
    case "follow":
      console.log(`User followed: ${event.source.userId}`);
      break;
    case "postback":
      return handlePostback(event, env);
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
```

### 3. Text Message Handler

```javascript
/**
 * Handles incoming text messages
 */
async function handleTextMessage(event, env) {
  const text = event.message.text.trim();
  const userId = event.source.userId;

  // Command to show the model selection menu
  if (text.toLowerCase() === "/model" || text.toLowerCase() === "menu") {
    return sendModelMenu(event, env);
  }

  // Retrieve user's preferred model from KV
  let currentModel = await env.KV.get(`user_model:${userId}`);

  // If not set, try to fetch the default model from the API
  if (!currentModel) {
    try {
      const response = await fetch(`${env.BASE_URL}/models`);
      if (response.ok) {
        const data = await response.json();
        currentModel = data.defaultModel;
      }
    } catch (err) {
      console.error("Failed to fetch default model from API:", err);
    }
  }

  // Final fallback
  currentModel = currentModel || "gpt-4o";

  const body = JSON.stringify({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: `[Model: ${currentModel}] You said: ${text}\n\n(This is where the LLM response would go.)`,
      },
    ],
  });

  return callLineApi("/v2/bot/message/reply", body, env);
}
```

### 4. Model Menu Sender with Quick Reply

```javascript
/**
 * Dynamically fetches models from the BASE_URL and sends a Quick Reply menu
 */
async function sendModelMenu(event, env) {
  let quickReplyItems = [];

  try {
    const response = await fetch(`${env.BASE_URL}/models`);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    
    const data = await response.json();
    const models = data.models || [];

    // Map the models from API to LINE Quick Reply actions
    // Note: LINE supports max 13 quick reply items
    quickReplyItems = models.slice(0, 13).map(model => ({
      type: "action",
      action: {
        type: "postback",
        label: model.displayName.length > 20 ? model.displayName.substring(0, 17) + "..." : model.displayName,
        data: `action=set_model&model=${model.name}`,
        displayText: `Selecting ${model.displayName}`
      }
    }));

  } catch (err) {
    console.error("Error fetching models:", err);
    // Fallback message if API fails
    return callLineApi("/v2/bot/message/reply", JSON.stringify({
      replyToken: event.replyToken,
      messages: [{ type: "text", text: "Unable to fetch models right now. Please try again later." }]
    }), env);
  }

  const body = JSON.stringify({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: "Please select your preferred LLM model:",
        quickReply: {
          items: quickReplyItems
        }
      }
    ]
  });

  return callLineApi("/v2/bot/message/reply", body, env);
}
```

### 5. Postback Handler

```javascript
/**
 * Handles postback events (e.g., from button clicks)
 */
async function handlePostback(event, env) {
  const data = new URLSearchParams(event.postback.data);
  const action = data.get("action");
  const userId = event.source.userId;

  if (action === "set_model") {
    const model = data.get("model");
    
    // Persist the model preference in KV
    await env.KV.put(`user_model:${userId}`, model);
    
    const body = JSON.stringify({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: `Success! Your default model is now: ${model}`,
        },
      ],
    });

    return callLineApi("/v2/bot/message/reply", body, env);
  }
}
```

### 6. LINE API Caller Helper

```javascript
/**
 * Helper to call the LINE Messaging API
 */
async function callLineApi(endpoint, body, env) {
  const url = `https://api.line.me${endpoint}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`LINE API Error (${endpoint}): ${response.status} ${errorText}`);
    throw new Error(`LINE API error: ${response.status}`);
  }

  return response;
}
```

## Cloudflare Worker Main Handler

```javascript
export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const signature = request.headers.get("x-line-signature");
    if (!signature) {
      return new Response("Missing Signature", { status: 401 });
    }

    const body = await request.text();

    // 1. Verify Signature
    const isValid = await verifySignature(body, signature, env.LINE_CHANNEL_SECRET);
    if (!isValid) {
      console.error("Invalid Signature");
      return new Response("Invalid Signature", { status: 401 });
    }

    const payload = JSON.parse(body);
    const events = payload.events || [];

    // 2. Process Events
    // Note: In a real app, you might want to use ctx.waitUntil for long-running tasks
    for (const event of events) {
      try {
        await handleEvent(event, env);
      } catch (err) {
        console.error("Error handling event:", err);
      }
    }

    return new Response("OK", { status: 200 });
  },
};
```

## Key API Endpoints Used

- **Reply Message**: `POST https://api.line.me/v2/bot/message/reply`
- **External Models API**: `${BASE_URL}/models` (custom endpoint)

## Data Storage

- **KV Store**: Used for storing user preferences (`user_model:{userId}`)

## Event Types Handled

- `message` (specifically `text` type)
- `follow`
- `postback`

## Quick Reply Actions Format

```javascript
{
  type: "action",
  action: {
    type: "postback",
    label: "Display Text",
    data: "action=set_model&model=model_name",
    displayText: "Text shown when selected"
  }
}
```

This configuration provides a complete LINE Bot integration with signature verification, event routing, message handling, and persistent storage capabilities.