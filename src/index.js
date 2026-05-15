/**
 * LINE Messaging API Webhook Handler for Cloudflare Workers
 */

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

  // Retrieve user's preferred model from KV (default to gpt-4o if not set)
  const currentModel = await env.KV.get(`user_model:${userId}`) || "gpt-4o";

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

/**
 * Sends a message with Quick Reply buttons to choose a model
 */
async function sendModelMenu(event, env) {
  const body = JSON.stringify({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: "Please select your preferred LLM model:",
        quickReply: {
          items: [
            {
              type: "action",
              action: {
                type: "postback",
                label: "GPT-4o",
                data: "action=set_model&model=gpt-4o",
                displayText: "Set model to GPT-4o"
              }
            },
            {
              type: "action",
              action: {
                type: "postback",
                label: "Claude 3.5 Sonnet",
                data: "action=set_model&model=claude-3-5-sonnet",
                displayText: "Set model to Claude 3.5 Sonnet"
              }
            },
            {
              type: "action",
              action: {
                type: "postback",
                label: "Gemini 1.5 Pro",
                data: "action=set_model&model=gemini-1-5-pro",
                displayText: "Set model to Gemini 1.5 Pro"
              }
            }
          ]
        }
      }
    ]
  });

  return callLineApi("/v2/bot/message/reply", body, env);
}

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
