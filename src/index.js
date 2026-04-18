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
      console.log(`Postback received: ${event.postback.data}`);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Handles incoming text messages and echoes them back
 */
async function handleTextMessage(event, env) {
  const replyToken = event.replyToken;
  const userText = event.message.text;

  const body = JSON.stringify({
    replyToken: replyToken,
    messages: [
      {
        type: "text",
        text: `Echo: ${userText}`,
      },
    ],
  });

  return callLineApi("/v2/bot/message/reply", body, env);
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
