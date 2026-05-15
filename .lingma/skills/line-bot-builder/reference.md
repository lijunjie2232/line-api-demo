# LINE Messaging API Reference

Quick reference for LINE Messaging API endpoints and specifications.

## Base URLs

- **Messaging API**: `https://api.line.me/v2/bot`
- **Data API** (content): `https://api-data.line.me/v2/bot`

## Authentication

All API requests require:
```
Authorization: Bearer {channel_access_token}
Content-Type: application/json
```

## Message Sending Endpoints

### Reply Message
**POST** `/message/reply`

Respond to user actions immediately.

```json
{
  "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
  "messages": [
    {
      "type": "text",
      "text": "Hello!"
    }
  ]
}
```

**Limits:**
- Max 5 messages per request
- Reply token valid for 60 seconds
- Cannot reply to unfollow/leave events

---

### Push Message
**POST** `/message/push`

Send messages anytime to users, groups, or rooms.

```json
{
  "to": "U4af4980629...",
  "messages": [
    {
      "type": "text",
      "text": "Hello!"
    }
  ]
}
```

**Limits:**
- Max 5 messages per request
- Monthly quota applies

---

### Multicast Message
**POST** `/message/multicast`

Send to multiple users at once (up to 150 users per request).

```json
{
  "to": ["U4af4980629...", "U0123456789..."],
  "messages": [
    {
      "type": "text",
      "text": "Hello everyone!"
    }
  ]
}
```

---

### Broadcast Message
**POST** `/message/broadcast`

Send to all followers.

```json
{
  "messages": [
    {
      "type": "text",
      "text": "Important announcement!"
    }
  ]
}
```

---

### Narrowcast Message
**POST** `/message/narrowcast`

Send to targeted audience based on demographics or attributes.

```json
{
  "messages": [{ "type": "text", "text": "Targeted message" }],
  "recipient": {
    "type": "audience",
    "audienceGroupId": 5614991017776
  },
  "filter": {
    "demographic": {
      "type": "gender",
      "oneOf": ["female"]
    }
  },
  "limit": {
    "max": 100,
    "upToRemainingQuota": true
  }
}
```

**Check Progress:**
**GET** `/message/progress/narrowcast?requestId={request_id}`

---

## Content Management

### Get Content (Images, Videos, Audio)
**GET** `/message/{messageId}/content`

Download user-sent media files.

Returns binary content.

---

### Get Content Preview
**GET** `/message/{messageId}/content/preview`

Get thumbnail/preview of images or videos.

---

## User Information

### Get Profile
**GET** `/profile/{userId}`

Returns:
```json
{
  "displayName": "LINE Botto",
  "userId": "U4af4980629...",
  "pictureUrl": "https://profile.line-scdn.net/...",
  "statusMessage": "Hello world!"
}
```

---

### Get Group/Room Member Profile
**GET** `/group/{groupId}/member/{userId}`
**GET** `/room/{roomId}/member/{userId}`

---

### Get Group/Room Member IDs
**GET** `/group/{groupId}/members/ids`
**GET** `/room/{roomId}/members/ids`

Returns up to 100 IDs per request. Use `start` parameter for pagination.

```json
{
  "memberIds": ["U4af4980629...", "..."],
  "next": "continuation_token"
}
```

---

### Get Group/Room Summary
**GET** `/group/{groupId}/summary`
**GET** `/room/{roomId}/summary`

Returns group name and member count.

---

### Get Bot Info
**GET** `/info`

Returns bot's userId and basicInfo.

---

## Rich Menu Management

### Create Rich Menu
**POST** `/richmenu`

```json
{
  "size": { "width": 2500, "height": 1686 },
  "selected": false,
  "name": "Main Menu",
  "chatBarText": "Menu",
  "areas": [
    {
      "bounds": { "x": 0, "y": 0, "width": 1250, "height": 843 },
      "action": { "type": "message", "text": "Products" }
    }
  ]
}
```

Returns: `{ "richMenuId": "richmenu-xxx" }`

---

### Delete Rich Menu
**DELETE** `/richmenu/{richMenuId}`

---

### Get Rich Menu List
**GET** `/richmenu/list`

---

### Upload Rich Menu Image
**POST** `/richmenu/{richMenuId}/content`

Content-Type: `image/png` or `image/jpeg`
Max size: 2500x1686px, 1MB

---

### Set Default Rich Menu
**POST** `/user/all/richmenu/{richMenuId}`

---

### Link Rich Menu to User
**POST** `/user/{userId}/richmenu/{richMenuId}`

---

### Unlink Rich Menu from User
**DELETE** `/user/{userId}/richmenu`

---

## Audience Management

### Create Upload Audience
**POST** `/bot/audienceGroup/upload`

```json
{
  "description": "VIP Customers",
  "isIfaAudience": false,
  "audiences": [
    { "id": "U4af4980629..." }
  ]
}
```

---

### Get Audience Group
**GET** `/bot/audienceGroup/{audienceGroupId}`

Returns status (`READY`, `IN_PROGRESS`, `FAILED`).

---

## Quota and Usage

### Get Message Quota
**GET** `/bot/message/quota`

Returns monthly message quota.

---

### Get Consumption
**GET** `/bot/message/quota/consumption`

Returns messages sent this month.

---

## Webhook Configuration

### Test Webhook Connection
In LINE Developers Console, click "Verify" next to webhook URL.

Server must respond with HTTP 200 to verify.

---

## Message Object Specifications

### Text Message
```json
{
  "type": "text",
  "text": "Hello!",
  "quickReply": { ... },
  "sender": { ... }
}
```

**Limits:**
- Max 5000 characters
- Unicode emojis supported
- LINE emojis supported

---

### Sticker Message
```json
{
  "type": "sticker",
  "packageId": "1",
  "stickerId": "1"
}
```

Find sticker IDs in official documentation.

---

### Image Message
```json
{
  "type": "image",
  "originalContentUrl": "https://example.com/original.jpg",
  "previewImageUrl": "https://example.com/preview.jpg"
}
```

**Requirements:**
- Both URLs must be HTTPS
- Image format: JPEG or PNG
- Max file size: 10MB (original), 1MB (preview)
- Preview recommended: 240x240px

---

### Video Message
```json
{
  "type": "video",
  "originalContentUrl": "https://example.com/video.mp4",
  "previewImageUrl": "https://example.com/preview.jpg",
  "trackingId": "optional_tracking_id"
}
```

**Requirements:**
- Format: MP4 (H.264)
- Max duration: 1 minute
- Max file size: 200MB

---

### Audio Message
```json
{
  "type": "audio",
  "originalContentUrl": "https://example.com/audio.m4a",
  "duration": 60000
}
```

**Requirements:**
- Format: M4A (AAC-LC)
- Max duration: 1 minute
- Max file size: 10MB

---

### Location Message
```json
{
  "type": "location",
  "title": "Our Store",
  "address": "1-1 Shibuya, Tokyo",
  "latitude": 35.659108,
  "longitude": 139.703729
}
```

---

### Flex Message
```json
{
  "type": "flex",
  "altText": "Flex Message",
  "contents": {
    "type": "bubble",
    "body": { ... }
  }
}
```

See Flex Message documentation for complete structure.

---

### Template Messages

#### Buttons Template
```json
{
  "type": "template",
  "altText": "Buttons Template",
  "template": {
    "type": "buttons",
    "thumbnailImageUrl": "https://example.com/image.jpg",
    "title": "Menu",
    "text": "Select an option",
    "actions": [
      {
        "type": "postback",
        "label": "Option 1",
        "data": "action=buy&itemid=123"
      },
      {
        "type": "message",
        "label": "Option 2",
        "text": "Confirm"
      },
      {
        "type": "uri",
        "label": "View Details",
        "uri": "https://example.com"
      }
    ]
  }
}
```

**Limits:**
- Max 4 actions
- Title: max 40 characters
- Text: max 160 characters

---

#### Confirm Template
```json
{
  "type": "template",
  "altText": "Confirm Template",
  "template": {
    "type": "confirm",
    "text": "Are you sure?",
    "actions": [
      {
        "type": "message",
        "label": "Yes",
        "text": "yes"
      },
      {
        "type": "message",
        "label": "No",
        "text": "no"
      }
    ]
  }
}
```

---

#### Carousel Template
```json
{
  "type": "template",
  "altText": "Carousel",
  "template": {
    "type": "carousel",
    "columns": [
      {
        "thumbnailImageUrl": "https://example.com/1.jpg",
        "title": "Product 1",
        "text": "Description",
        "actions": [...]
      },
      {
        "thumbnailImageUrl": "https://example.com/2.jpg",
        "title": "Product 2",
        "text": "Description",
        "actions": [...]
      }
    ],
    "imageAspectRatio": "rectangle",
    "imageSize": "cover"
  }
}
```

**Limits:**
- Max 10 columns
- Max 5 actions per column

---

## Action Types

### Postback Action
```json
{
  "type": "postback",
  "label": "Buy",
  "data": "action=buy&itemid=123",
  "displayText": "Optional display text"
}
```

Triggers postback event with data.

---

### Message Action
```json
{
  "type": "message",
  "label": "Yes",
  "text": "Confirmed"
}
```

Sends specified text as user message.

---

### URI Action
```json
{
  "type": "uri",
  "label": "Website",
  "uri": "https://example.com",
  "altUri": {
    "desktop": "https://example.com/desktop"
  }
}
```

Opens URL in browser.

---

### Datetime Picker Action
```json
{
  "type": "datetimepicker",
  "label": "Select Date",
  "data": "action=reserve",
  "mode": "date",
  "initial": "2024-01-01",
  "min": "2024-01-01",
  "max": "2024-12-31"
}
```

Modes: `date`, `time`, `datetime`

---

## Quick Reply Specification

```json
{
  "quickReply": {
    "items": [
      {
        "type": "action",
        "imageUrl": "https://example.com/icon.png",
        "action": {
          "type": "message",
          "label": "Label",
          "text": "Text to send"
        }
      }
    ]
  }
}
```

**Limits:**
- Max 13 items
- Icon: PNG, max 80x80px, 1MB

---

## Error Codes

Common error responses:

| Code | Meaning |
|------|---------|
| 400 | Invalid request (bad parameters) |
| 401 | Invalid access token |
| 403 | Forbidden (quota exceeded, etc.) |
| 404 | Resource not found |
| 429 | Too many requests (rate limit) |
| 500 | Server error |

Error response format:
```json
{
  "message": "The request body has 2 error(s)",
  "details": [
    {
      "message": "May not be empty",
      "property": "messages[0].text"
    }
  ]
}
```

---

## Rate Limits

- **Reply/Push**: No explicit rate limit, but respect user experience
- **Broadcast**: Limited by monthly quota
- **Narrowcast**: Limited by monthly quota
- **API calls**: Generally 100 requests/second per endpoint

Monitor quota usage regularly.

---

## Webhook Event Objects

### Message Event
```json
{
  "type": "message",
  "message": {
    "id": "message_id",
    "type": "text",
    "text": "User message"
  },
  "replyToken": "token",
  "source": {
    "type": "user",
    "userId": "U..."
  },
  "timestamp": 1234567890,
  "mode": "active"
}
```

---

### Follow Event
```json
{
  "type": "follow",
  "replyToken": "token",
  "source": {
    "type": "user",
    "userId": "U..."
  },
  "timestamp": 1234567890
}
```

---

### Unfollow Event
```json
{
  "type": "unfollow",
  "source": {
    "type": "user",
    "userId": "U..."
  },
  "timestamp": 1234567890
}
```

Note: Cannot reply to unfollow events.

---

### Postback Event
```json
{
  "type": "postback",
  "postback": {
    "data": "action=buy&itemid=123",
    "params": {
      "date": "2024-01-01"
    }
  },
  "replyToken": "token",
  "source": {
    "type": "user",
    "userId": "U..."
  },
  "timestamp": 1234567890
}
```

---

## Best Practices

### Signature Verification
Always verify webhook signatures using HMAC-SHA256 with channel secret.

### Idempotency
Use `webhookEventId` to detect duplicate events during redelivery.

### Timestamp Validation
Check `timestamp` to ensure events are recent (within 5 minutes).

### Async Processing
Process webhooks asynchronously to avoid timeouts.

### Error Handling
Return HTTP 200 even if processing fails to prevent infinite redelivery loops.

---

For complete specifications, refer to the official LINE Messaging API Reference documentation in `downloaded_docs/ja/docs/messaging-api/`.
