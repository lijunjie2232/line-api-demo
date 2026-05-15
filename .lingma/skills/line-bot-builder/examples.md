# LINE Bot Implementation Examples

Detailed code examples for common LINE bot scenarios.

## Complete Webhook Handler (Cloudflare Workers)

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

    // Verify signature
    const isValid = await verifySignature(body, signature, env.LINE_CHANNEL_SECRET);
    if (!isValid) {
      return new Response("Invalid Signature", { status: 401 });
    }

    const payload = JSON.parse(body);
    
    // Process events asynchronously
    for (const event of payload.events) {
      ctx.waitUntil(handleEvent(event, env).catch(err => {
        console.error("Event handling failed:", err);
      }));
    }

    return new Response("OK", { status: 200 });
  },
};
```

## Message Type Examples

### Text with Emojis
```javascript
{
  type: "text",
  text: "Hello! 👋 Welcome to our service! 🎉"
}
```

### Text with Quick Replies
```javascript
{
  type: "text",
  text: "How can I help you today?",
  quickReply: {
    items: [
      {
        type: "action",
        action: {
          type: "message",
          label: "📦 Track Order",
          text: "track order"
        }
      },
      {
        type: "action",
        action: {
          type: "message",
          label: "❓ FAQ",
          text: "faq"
        }
      },
      {
        type: "action",
        action: {
          type: "uri",
          label: "🌐 Website",
          uri: "https://example.com"
        }
      }
    ]
  }
}
```

### Image Message
```javascript
{
  type: "image",
  originalContentUrl: "https://example.com/images/product-full.jpg",
  previewImageUrl: "https://example.com/images/product-preview.jpg"
}
```

### Sticker Message
Popular sticker packages:
- Package ID 1: Stickers (IDs: 1-10)
- Package ID 2: Animation stickers
- Package ID 40: Popular stickers

```javascript
{
  type: "sticker",
  packageId: "1",
  stickerId: "1"
}
```

### Location Message
```javascript
{
  type: "location",
  title: "Our Store",
  address: "1-1 Shibuya, Tokyo",
  latitude: 35.659108,
  longitude: 139.703729
}
```

## Flex Message Examples

### Simple Product Card
```javascript
{
  type: "flex",
  altText: "Product Card",
  contents: {
    type: "bubble",
    hero: {
      type: "image",
      url: "https://example.com/product.jpg",
      size: "full",
      aspectRatio: "16:9",
      aspectMode: "cover"
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "Premium Widget",
          weight: "bold",
          size: "xl"
        },
        {
          type: "text",
          text: "$99.99",
          color: "#ff0000",
          weight: "bold",
          size: "lg",
          margin: "md"
        },
        {
          type: "text",
          text: "High-quality widget with premium features.",
          wrap: true,
          margin: "md",
          size: "sm"
        }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          action: {
            type: "uri",
            label: "Buy Now",
            uri: "https://example.com/buy"
          }
        }
      ]
    }
  }
}
```

### Carousel Template
```javascript
{
  type: "template",
  altText: "Product Carousel",
  template: {
    type: "carousel",
    columns: [
      {
        thumbnailImageUrl: "https://example.com/product1-thumb.jpg",
        title: "Product A",
        text: "Description of product A",
        actions: [
          {
            type: "postback",
            label: "View Details",
            data: "product_id=A"
          },
          {
            type: "uri",
            label: "Buy",
            uri: "https://example.com/product-a"
          }
        ]
      },
      {
        thumbnailImageUrl: "https://example.com/product2-thumb.jpg",
        title: "Product B",
        text: "Description of product B",
        actions: [
          {
            type: "postback",
            label: "View Details",
            data: "product_id=B"
          },
          {
            type: "uri",
            label: "Buy",
            uri: "https://example.com/product-b"
          }
        ]
      }
    ]
  }
}
```

## Action Types

### Postback Action
Sends data back to bot without displaying it:
```javascript
{
  type: "postback",
  label: "Select Option",
  data: "action=select&option=premium"
}
```

### Message Action
Sends a predefined message:
```javascript
{
  type: "message",
  label: "Show Menu",
  text: "menu"
}
```

### URI Action
Opens URL in browser:
```javascript
{
  type: "uri",
  label: "Visit Website",
  uri: "https://example.com"
}
```

### Datetime Picker Action
```javascript
{
  type: "datetimepicker",
  label: "Select Date",
  data: "action=reserve",
  mode: "date",
  initial: "2024-01-01",
  min: "2024-01-01",
  max: "2024-12-31"
}
```

## User Profile Handling

```javascript
async function greetUser(userId, replyToken, env) {
  // Get user profile
  const profile = await getUserProfile(userId, env);
  
  // Send personalized greeting
  return sendReply(replyToken, [{
    type: "text",
    text: `Hello ${profile.displayName}! Welcome to our service! 👋`
  }], env);
}

async function getUserProfile(userId, env) {
  const url = `https://api.line.me/v2/bot/profile/${userId}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get profile: ${response.status}`);
  }
  
  return response.json();
}
```

## Group Chat Management

### Get Group Member IDs
```javascript
async function getGroupMemberIds(groupId, env) {
  const memberIds = [];
  let start = null;
  
  while (true) {
    const url = new URL('https://api.line.me/v2/bot/group/' + groupId + '/members/ids');
    if (start) {
      url.searchParams.set('start', start);
    }
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });
    
    const data = await response.json();
    memberIds.push(...data.memberIds);
    
    if (data.next) {
      start = data.next;
    } else {
      break;
    }
  }
  
  return memberIds;
}
```

### Send Message to Group
```javascript
async function sendToGroup(groupId, messages, env) {
  const url = "https://api.line.me/v2/bot/group/" + groupId + "/message/push";
  const body = JSON.stringify({ messages });
  
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

## Content Retrieval

### Download User-Sent Images
```javascript
async function downloadUserImage(messageId, env) {
  const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download content: ${response.status}`);
  }
  
  return response.arrayBuffer();
}
```

## Broadcast and Multicast

### Broadcast to All Followers
```javascript
async function broadcastMessage(messages, env) {
  const url = "https://api.line.me/v2/bot/message/broadcast";
  const body = JSON.stringify({ messages });
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: body
  });
  
  return response.json();
}
```

### Multicast to Specific Users
```javascript
async function multicastMessage(userIds, messages, env) {
  const url = "https://api.line.me/v2/bot/message/multicast";
  const body = JSON.stringify({
    to: userIds,
    messages: messages
  });
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: body
  });
  
  return response.json();
}
```

## Rich Menu Implementation

### Create Rich Menu
```javascript
async function createRichMenu(env) {
  const menuObject = {
    size: {
      width: 2500,
      height: 1686
    },
    selected: false,
    name: "Main Menu",
    chatBarText: "Menu",
    areas: [
      {
        bounds: { x: 0, y: 0, width: 1250, height: 843 },
        action: {
          type: "message",
          text: "Products"
        }
      },
      {
        bounds: { x: 1250, y: 0, width: 1250, height: 843 },
        action: {
          type: "message",
          text: "Support"
        }
      },
      {
        bounds: { x: 0, y: 843, width: 1250, height: 843 },
        action: {
          type: "uri",
          uri: "https://example.com/about"
        }
      },
      {
        bounds: { x: 1250, y: 843, width: 1250, height: 843 },
        action: {
          type: "message",
          text: "Contact"
        }
      }
    ]
  };
  
  const url = "https://api.line.me/v2/bot/richmenu";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify(menuObject)
  });
  
  const data = await response.json();
  return data.richMenuId;
}
```

### Upload Rich Menu Image
```javascript
async function uploadRichMenuImage(richMenuId, imagePath, env) {
  const url = `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`;
  
  // Read image file and convert to appropriate format
  const imageBuffer = await readFile(imagePath);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: imageBuffer
  });
  
  return response.ok;
}
```

### Set Default Rich Menu
```javascript
async function setDefaultRichMenu(richMenuId, env) {
  const url = `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
    }
  });
  
  return response.ok;
}
```

## Error Handling and Retry Logic

```javascript
async function callLineApiWithRetry(endpoint, body, env, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await callLineApi(endpoint, body, env);
      
      if (response.ok) {
        return response;
      }
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        const errorText = await response.text();
        console.error(`LINE API Client Error: ${response.status} ${errorText}`);
        throw new Error(`LINE API error: ${response.status}`);
      }
      
      // Retry on server errors (5xx)
      console.warn(`LINE API attempt ${attempt} failed, retrying...`);
      
      if (attempt === maxRetries) {
        throw new Error(`LINE API error after ${maxRetries} attempts: ${response.status}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      
    } catch (err) {
      if (attempt === maxRetries) {
        throw err;
      }
      console.warn(`Attempt ${attempt} failed:`, err.message);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

## Conversation State Management

Using Cloudflare KV for state:

```javascript
// Save conversation state
async function saveUserState(userId, state, env) {
  await env.KV.put(`state:${userId}`, JSON.stringify(state), {
    expirationTtl: 3600 // Expire after 1 hour
  });
}

// Load conversation state
async function loadUserState(userId, env) {
  const state = await env.KV.get(`state:${userId}`);
  return state ? JSON.parse(state) : null;
}

// Example usage in handler
async function handleTextMessage(event, env) {
  const userId = event.source.userId;
  const userState = await loadUserState(userId, env);
  
  if (userState?.waitingForInput) {
    // Handle expected input
    return handleExpectedInput(event, userState, env);
  } else {
    // Handle general message
    return handleGeneralMessage(event, env);
  }
}
```

## Logging and Monitoring

```javascript
function logWebhookEvent(event) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    eventType: event.type,
    sourceType: event.source?.type,
    userId: event.source?.userId,
    messageId: event.message?.id,
    messageType: event.message?.type
  }));
}

function logApiResponse(endpoint, status, duration) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    endpoint,
    status,
    duration_ms: duration
  }));
}
```

These examples cover the most common LINE bot implementation patterns. For complete API specifications, refer to the markdown files in `downloaded_docs/ja/docs/messaging-api/`.
