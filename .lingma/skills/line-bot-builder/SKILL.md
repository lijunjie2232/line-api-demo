---
name: line-bot-builder
description: Build LINE bots step-by-step using Messaging API. Use when creating LINE bots, implementing webhook handlers, sending messages (text, images, stickers, Flex Messages), handling user interactions, or working with LINE Official Accounts. Guides through setup, webhook configuration, message types, and best practices.
---

# LINE Bot Builder

Build production-ready LINE bots using the Messaging API with comprehensive documentation from `downloaded_docs/`.

## Quick Start

Follow this workflow to build a LINE bot:

1. [Setup LINE Official Account](#1-setup-line-official-account)
2. [Configure Webhook](#2-configure-webhook)
3. [Handle Incoming Messages](#3-handle-incoming-messages)
4. [Send Responses](#4-send-responses)
5. [Advanced Features](#5-advanced-features)

## 1. Setup LINE Official Account

### Create Channel
- Create LINE Official Account via [LINE Official Account Manager](https://manager.line.biz/)
- Enable Messaging API in account settings
- Access channel credentials in [LINE Developers Console](https://developers.line.biz/console/)

### Required Credentials
Store these securely:
- **Channel ID**: Unique identifier for your bot
- **Channel Secret**: Used for signature verification
- **Channel Access Token**: For API authentication (use v2.1 with custom expiration)

Reference: `downloaded_docs/ja/docs/messaging-api/getting-started/index.html.md`

## 2. Configure Webhook

### Set Webhook URL
In LINE Developers Console → Messaging API Settings:
1. Enter HTTPS endpoint URL
2. Click "Verify" to test connectivity
3. Enable "Use webhook"

### Verify Signature (CRITICAL)
Always validate incoming requests:

```javascript
async function verifySignature(body, signature, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const bodyData = encoder.encode(body);
  
  const key = await crypto.subtle.importKey(
    "raw", keyData,
    { name: "HMAC", hash: "SHA-256" },
    false, ["sign"]
  );
  
  const mac = await crypto.subtle.sign("HMAC", key, bodyData);
  const base64Mac = btoa(String.fromCharCode(...new Uint8Array(mac)));
  
  return base64Mac === signature;
}
```

**Security Warning**: Never process webhook events without signature verification.

Reference: `downloaded_docs/ja/docs/messaging-api/building-bot/index.html.md`, `downloaded_docs/ja/docs/messaging-api/verify-webhook-signature/index.html.md`

## 3. Handle Incoming Messages

### Webhook Event Types

| Event Type | When Received | Action Required |
|------------|---------------|-----------------|
| `message` | User sends message | Reply with response |
| `follow` | User adds bot as friend | Optional greeting |
| `unfollow` | User blocks bot | Log/cleanup |
| `postback` | User taps action button | Process action data |
| `join` | Bot joins group chat | Send welcome message |
| `leave` | Bot leaves group | Cleanup |

### Message Event Structure
```json
{
  "type": "message",
  "message": {
    "type": "text",
    "id": "message_id",
    "text": "User message content",
    "quoteToken": "optional_token"
  },
  "replyToken": "token_for_reply",
  "source": {
    "type": "user",
    "userId": "Uxxxxxxxxx"
  },
  "timestamp": 1234567890
}
```

### Event Handler Pattern
```javascript
async function handleEvent(event, env) {
  switch (event.type) {
    case "message":
      if (event.message.type === "text") {
        return handleTextMessage(event, env);
      } else if (event.message.type === "image") {
        return handleImageMessage(event, env);
      }
      break;
    case "follow":
      return handleFollow(event, env);
    case "postback":
      return handlePostback(event, env);
    default:
      console.log(`Unhandled event: ${event.type}`);
  }
}
```

Reference: `downloaded_docs/ja/docs/messaging-api/receiving-messages/index.html.md`

## 4. Send Responses

### Reply Messages (Immediate Response)
Use when responding to user actions:

```javascript
async function sendReply(replyToken, messages, env) {
  const url = "https://api.line.me/v2/bot/message/reply";
  const body = JSON.stringify({
    replyToken: replyToken,
    messages: messages // Max 5 messages per request
  });
  
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: body
  });
}
```

### Push Messages (Anytime)
Send messages outside of conversation context:

```javascript
async function sendPush(userId, messages, env) {
  const url = "https://api.line.me/v2/bot/message/push";
  const body = JSON.stringify({
    to: userId,
    messages: messages
  });
  
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: body
  });
}
```

### Message Types

#### Text Message
```json
{
  "type": "text",
  "text": "Hello, world!"
}
```

#### Sticker Message
Find sticker IDs in `downloaded_docs/ja/docs/messaging-api/sticker-list.html`:
```json
{
  "type": "sticker",
  "packageId": "1",
  "stickerId": "1"
}
```

#### Image Message
Requires both original and preview URLs (HTTPS):
```json
{
  "type": "image",
  "originalContentUrl": "https://example.com/original.jpg",
  "previewImageUrl": "https://example.com/preview.jpg"
}
```

#### Flex Message
Customizable layout using CSS Flexbox. See Flex Message guide below.

Reference: `downloaded_docs/ja/docs/messaging-api/sending-messages/index.html.md`, `downloaded_docs/ja/docs/messaging-api/message-types/index.html.md`

## 5. Advanced Features

### Flex Messages
Complex, customizable message layouts.

**Basic Bubble Structure:**
```json
{
  "type": "flex",
  "altText": "Flex Message",
  "contents": {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "Hello, Flex!"
        }
      ]
    }
  }
}
```

**Key Components:**
- **Bubble**: Main container
- **Box**: Layout container (vertical/horizontal/baseline)
- **Text/Image/Button**: Content elements
- **Separator/Spacer/Filler**: Layout helpers

Reference: `downloaded_docs/ja/docs/messaging-api/using-flex-messages/index.html.md`, `downloaded_docs/ja/docs/messaging-api/flex-message-elements/index.html.md`

### Quick Replies
Add action buttons below messages:

```json
{
  "type": "text",
  "text": "Choose an option:",
  "quickReply": {
    "items": [
      {
        "type": "action",
        "action": {
          "type": "message",
          "label": "Option 1",
          "text": "Selected Option 1"
        }
      },
      {
        "type": "action",
        "action": {
          "type": "uri",
          "label": "Visit Website",
          "uri": "https://example.com"
        }
      }
    ]
  }
}
```

Reference: `downloaded_docs/ja/docs/messaging-api/using-quick-reply/index.html.md`

### Rich Menus
Create persistent menu at bottom of chat:

1. Create rich menu object with areas and actions
2. Upload menu image (PNG, max 2500x1686px)
3. Link menu to users or set as default

Reference: `downloaded_docs/ja/docs/messaging-api/using-rich-menus/index.html.md`

### Get User Profile
Retrieve user information:

```javascript
async function getUserProfile(userId, env) {
  const url = `https://api.line.me/v2/bot/profile/${userId}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    }
  });
  return response.json();
  // Returns: { displayName, userId, pictureUrl, statusMessage }
}
```

Reference: `downloaded_docs/ja/docs/messaging-api/getting-user-ids/index.html.md`

### Group Chat Support
Handle group/multi-person chats:

- Get group member IDs
- Send messages to groups
- Handle join/leave events
- Get group profile

Reference: `downloaded_docs/ja/docs/messaging-api/group-chats/index.html.md`

## Best Practices

### Security
- ✅ Always verify webhook signatures
- ✅ Use HTTPS for all endpoints
- ✅ Store secrets in environment variables
- ❌ Never expose channel secret in client code
- ❌ Never log sensitive credentials

### Performance
- ✅ Process webhooks asynchronously
- ✅ Use `ctx.waitUntil()` for long operations (Cloudflare Workers)
- ✅ Implement retry logic for failed API calls
- ✅ Cache user profiles when appropriate

### Error Handling
```javascript
try {
  await handleEvent(event, env);
} catch (err) {
  console.error("Event handling failed:", err);
  // Don't throw - return 200 to prevent redelivery loops
}
```

### Message Limits
- Reply/Push: Max 5 messages per request
- Text: Max 5000 characters
- Monitor monthly quota for narrowcast/broadcast

## Common Patterns

### Echo Bot (Testing)
```javascript
async function handleTextMessage(event, env) {
  return sendReply(event.replyToken, [{
    type: "text",
    text: `You said: ${event.message.text}`
  }], env);
}
```

### Menu System
```javascript
// Send template with quick replies
const menuMessage = {
  type: "text",
  text: "What would you like to do?",
  quickReply: {
    items: [
      { type: "action", action: { type: "message", label: "Help", text: "help" } },
      { type: "action", action: { type: "message", label: "Status", text: "status" } }
    ]
  }
};
```

### State Management
Track conversation state using user ID as key:
```javascript
// In Cloudflare Workers, use KV storage or external database
const userState = await env.KV.get(`state:${event.source.userId}`);
```

## Troubleshooting

### Webhook Not Receiving Events
1. Verify webhook URL is HTTPS with valid SSL certificate
2. Check "Use webhook" is enabled in console
3. Review server logs for signature verification failures
4. Test with LINE's webhook verification tool

### API Returns 401 Unauthorized
- Verify channel access token is correct and not expired
- Check token type matches your usage (v2.1 recommended)
- Regenerate token if necessary

### Messages Not Delivered
- Verify user hasn't blocked the bot
- Check monthly message quota
- Review error responses from API

## Reference Documentation

All documentation available in `downloaded_docs/ja/docs/messaging-api/`:

**Complete Index**: See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for a comprehensive list of all 70+ documentation files organized by topic.

**Core Concepts:**
- Getting Started: `getting-started/index.html.md`
- Building Bot: `building-bot/index.html.md`
- Sending Messages: `sending-messages/index.html.md`
- Receiving Messages: `receiving-messages/index.html.md`

**Message Types:**
- Overview: `message-types/index.html.md`
- Flex Messages: `using-flex-messages/index.html.md`
- Flex Elements: `flex-message-elements/index.html.md`
- Actions: `actions/index.html.md`

**Advanced Features:**
- Quick Reply: `using-quick-reply/index.html.md`
- Rich Menus: `using-rich-menus/index.html.md`
- Group Chats: `group-chats/index.html.md`
- Audience/Narrowcast: `using-audience/index.html.md`

**Security:**
- Webhook Signature: `verify-webhook-signature/index.html.md`
- Webhook URL Verification: `verify-webhook-url/index.html.md`

For complete file listings and quick navigation, refer to DOCUMENTATION_INDEX.md.

## Example Implementation

See existing implementation in `src/index.js` for:
- Webhook signature verification
- Event routing
- Reply message handling
- API call helper functions

This skill provides step-by-step guidance. For specific implementation details, reference the markdown files in `downloaded_docs/` directory.
