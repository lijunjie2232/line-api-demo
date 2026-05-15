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

// Simple in-memory store for user preferences (Note: In production, use Cloudflare KV)
const userPreferences = new Map();

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
      console.log(`Postback received: ${event.postback.data}`);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Handles incoming text messages and replies with a fixed construction message
 */
async function handleTextMessage(event, env) {
  const replyToken = event.replyToken;
  const userId = event.source.userId;
  const userText = event.message.text.trim();

  // Check for model selection commands
  if (userText.toLowerCase() === "/model") {
    return sendModelSelectionMenu(replyToken);
  }

  // Handle model selection from quick reply
  if (userText.startsWith("Use ")) {
    const selectedModel = userText.replace("Use ", "");
    userPreferences.set(userId, selectedModel);
    const body = JSON.stringify({
      replyToken: replyToken,
      messages: [
        {
          type: "text",
          text: `Model switched to: ${selectedModel}`,
        },
      ],
    });
    return callLineApi("/v2/bot/message/reply", body, env);
  }

  // Get current model preference (default to 'GPT-4')
  const currentModel = userPreferences.get(userId) || "GPT-4";

  const body = JSON.stringify({
    replyToken: replyToken,
    messages: [
      {
        type: "text",
        text: `[${currentModel}] The bot is under construction. You are currently using the ${currentModel} model.`,
        quickReply: {
          items: [
            {
              type: "action",
              action: {
                type: "message",
                label: "Change Model",
                text: "Select Model"
              }
            }
          ]
        }
      },
    ],
  });

  return callLineApi("/v2/bot/message/reply", body, env);
}

/**
 * Sends a menu with Quick Reply buttons to choose an LLM model
 */
async function sendModelSelectionMenu(replyToken) {
  const body = JSON.stringify({
    replyToken: replyToken,
    messages: [
      {
        type: "text",
        text: "Please select an LLM model:",
        quickReply: {
          items: [
            { type: "action", action: { type: "message", label: "GPT-4", text: "Use GPT-4" } },
            { type: "action", action: { type: "message", label: "Claude 3", text: "Use Claude 3" } },
            { type: "action", action: { type: "message", label: "Llama 3", text: "Use Llama 3" } }
          ]
        }
      },
    ],
  });

  return callLineApi("/v2/bot/message/reply", body, {});
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
