# LINE Messaging API Documentation Index

Complete index of all available documentation files in `downloaded_docs/ja/docs/messaging-api/` organized by topic and use case.

## 📚 Core Documentation

### Getting Started & Setup
- **Getting Started**: `getting-started/index.html.md`
  - Create LINE Official Account
  - Enable Messaging API
  - Access LINE Developers Console
  
- **Building Bot**: `building-bot/index.html.md`
  - Channel access tokens
  - Webhook URL configuration
  - Bot verification
  - LINE Official Account Manager settings

### Basic Operations
- **Sending Messages**: `sending-messages/index.html.md`
  - Reply messages
  - Push messages
  - Multicast messages
  - Broadcast messages
  - Narrowcast messages
  - Quote messages
  
- **Receiving Messages**: `receiving-messages/index.html.md`
  - Webhook event types
  - Signature verification
  - Content retrieval
  - User profile fetching
  - Webhook redelivery

---

## 💬 Message Types

### Overview
- **Message Types**: `message-types/index.html.md`
  - All message type specifications
  - Common features (quick reply)

### Specific Message Types
- **Text Messages**: (covered in message-types/index.html.md)
  - Standard text
  - Text with emojis
  - Text v2 (with mentions)
  
- **Sticker Messages**: `sticker-list.html`
  - Available sticker packages
  - Sticker IDs and package IDs
  
- **Image Messages**: (covered in message-types/index.html.md)
  - Original and preview URLs
  - Image specifications
  
- **Video Messages**: (covered in message-types/index.html.md)
  - Video URL and preview
  - Video tracking
  
- **Audio Messages**: (covered in message-types/index.html.md)
  - Audio file URL and duration
  
- **Location Messages**: (covered in message-types/index.html.md)
  - Title, address, coordinates
  
- **Coupon Messages**: (covered in message-types/index.html.md)
  - Coupon ID integration

### Advanced Message Types
- **Flex Messages**: 
  - **Using Flex Messages**: `using-flex-messages/index.html.md`
    - Bubble structure
    - Layout customization
  - **Flex Message Elements**: `flex-message-elements/index.html.md`
    - Box, text, image, button components
    - Spacers, separators, fillers
  - **Flex Message Layout**: `flex-message-layout/index.html.md`
    - Vertical/horizontal/baseline layouts
    - Nesting containers
  - **Flex Message Simulator**: `using-flex-message-simulator/index.html.md`
    - Testing Flex Messages
  - **Create Flex Message with Video**: `create-flex-message-including-video/index.html.md`

- **Template Messages**: (covered in message-types/index.html.md)
  - Buttons template
  - Confirm template
  - Carousel template
  - Image carousel template

- **Imagemap Messages**: (covered in message-types/index.html.md)
  - Interactive image areas
  - Video playback on imagemap

---

## 🎨 UI Components & Actions

### Actions
- **Actions**: `actions/index.html.md`
  - Postback action
  - Message action
  - URI action
  - Datetime picker action
  - Camera/camera roll actions
  - Location action

### Quick Reply
- **Using Quick Reply**: `using-quick-reply/index.html.md`
  - Quick reply button implementation
  - Action types in quick replies
  - Icon specifications

### Rich Menus
- **Rich Menus Overview**: `rich-menus-overview/index.html.md`
  - Rich menu concepts
  - Use cases
  
- **Using Rich Menus**: `using-rich-menus/index.html.md`
  - Create rich menu object
  - Upload rich menu image
  - Link/unlink menus
  - Set default menu
  
- **Per-User Rich Menus**: `use-per-user-rich-menus/index.html.md`
  - Individual user menu assignment
  - Menu switching
  
- **Switch Rich Menus**: `switch-rich-menus/index.html.md`
  - Dynamic menu changes
  - Menu transition strategies
  
- **Try Rich Menu**: `try-rich-menu/index.html.md`
  - Quick start with rich menus

---

## 👥 User Management & Groups

### User Information
- **Getting User IDs**: `getting-user-ids/index.html.md`
  - Extract user IDs from events
  - Group/room member IDs
  
- **User Consent**: `user-consent/index.html.md`
  - Permission handling
  - Privacy considerations

### Group Chats
- **Group Chats**: `group-chats/index.html.md`
  - Join/leave events
  - Send messages to groups
  - Get group member profiles
  - Group management

### Account Linking
- **Linking Accounts**: `linking-accounts/index.html.md`
  - Link token generation
  - Account link events
  - Service integration

---

## 📊 Audience & Targeting

### Audience Management
- **Using Audience**: `using-audience/index.html.md`
  - Create audience groups
  - Upload user IDs
  - Click/impression audiences
  - Audience status checking

### Narrowcast Messaging
- (Covered in sending-messages/index.html.md)
  - Demographic filters
  - Recipient objects
  - Redelivery targeting
  - Progress monitoring

### Statistics
- **Measure Impressions**: `measure-impressions/index.html.md`
  - Track message opens
  - Click-through rates
  - Impression analytics
  
- **Unit-Based Statistics Aggregation**: `unit-based-statistics-aggregation/index.html.md`
  - Aggregate statistics by unit
  - Performance metrics

---

## 🔧 Advanced Features

### Beacons
- **Using Beacons**: `using-beacons/index.html.md`
  - BLE beacon integration
  - Beacon events
  - Proximity messaging
  
- **Beacon Device Spec**: `beacon-device-spec/index.html.md`
  - Hardware specifications
  - Device compatibility

### Loading Indicator
- **Use Loading Indicator**: `use-loading-indicator/index.html.md`
  - Show typing animation
  - Improve UX during processing

### Mark as Read
- **Mark as Read**: `mark-as-read/index.html.md`
  - Message read status
  - Chat state management

### Membership Features
- **Use Membership Features**: `use-membership-features/index.html.md`
  - Member-only content
  - Tier-based features

### Coupons
- **Send Coupons to Users**: `send-coupons-to-users/index.html.md`
  - Coupon distribution
  - Redemption tracking

---

## 🔒 Security & Verification

### Webhook Security
- **Verify Webhook Signature**: `verify-webhook-signature/index.html.md`
  - HMAC-SHA256 verification
  - Security best practices
  
- **Verify Webhook URL**: `verify-webhook-url/index.html.md`
  - Webhook endpoint validation
  - HTTPS requirements

### Authentication
- **Generate JSON Web Token**: `generate-json-web-token/index.html.md`
  - JWT creation for API access
  - Token management
  
- **Get Quote Tokens**: `get-quote-tokens/index.html.md`
  - Retrieve quote tokens for message quoting
  - Quote message implementation

### SSL/TLS
- **SSL/TLS Spec of Webhook Source**: `ssl-tls-spec-of-the-webhook-source/index.html.md`
  - Certificate requirements
  - TLS version specifications

---

## 🛠️ Development Tools

### SDK & Samples
- **LINE Bot SDK**: `line-bot-sdk/index.html.md`
  - Official SDK documentation
  - Language-specific implementations
  
- **Node.js Sample**: `nodejs-sample/index.html.md`
  - Node.js example code
  - Implementation patterns
  
- **Secure Message Sample**: `secure-message-sample/index.html.md`
  - End-to-end encryption examples
  - Secure communication patterns

### Bot Designer
- **Download Bot Designer**: `download-bot-designer/index.html.md`
  - Visual bot builder tool
  - Design interface
  
- **Using Bot Designer**: `using-bot-designer/index.html.md`
  - Create flows visually
  - Test conversations

### LINE URL Scheme
- **Using LINE URL Scheme**: `using-line-url-scheme/index.html.md`
  - Deep linking to LINE features
  - Open chats, profiles, settings

---

## 📋 Configuration & Settings

### Bot Configuration
- **Icon/Nickname Switch**: `icon-nickname-switch/index.html.md`
  - Change bot appearance
  - Dynamic branding

### Sharing & Distribution
- **Sharing Bot**: `sharing-bot/index.html.md`
  - Bot promotion
  - QR code generation
  - Share links

### Webhook Management
- **Check Webhook Error Statistics**: `check-webhook-error-statistics/index.html.md`
  - Monitor webhook failures
  - Debug delivery issues
  
- **Retrying API Request**: `retrying-api-request/index.html.md`
  - Retry strategies
  - Exponential backoff
  - Idempotency handling

---

## 💰 Pricing & Limits

### Pricing Information
- **Pricing**: `pricing/index.html.md`
  - Message costs
  - Quota limits
  - Plan comparisons

### Character Counts
- **Text Character Count**: `text-character-count/index.html.md`
  - Message length limits
  - Character encoding
  - Emoji counting

---

## 🏢 Business & Management

### Account Management
- **Stop Using LINE Official Account**: `stop-using-line-official-account/index.html.md`
  - Account deletion
  - Data retention
  
- **Stop Using Messaging API**: `stop-using-messaging-api/index.html.md`
  - Disable API access
  - Cleanup procedures

### Development Guidelines
- **Development Guidelines**: `development-guidelines/index.html.md`
  - Best practices
  - Code quality standards
  - Performance optimization

---

## 📖 Reference Lists

### Quick Reference Files
- **Emoji List**: `emoji-list.html`
  - Available LINE emojis
  - Emoji codes and images
  
- **Sticker List**: `sticker-list.html`
  - All available stickers
  - Package and sticker IDs

---

## 🌟 Case Studies & Examples

### Technical Case Studies
Located in `technicalcase/` directory:

- **Boldly**: `technicalcase/boldly/index.html.md`
  - Real-world implementation example
  
- **Evolany AI**: `technicalcase/evolany-ai/index.html.md`
  - AI-powered bot case study
  
- **Heptagon**: `technicalcase/heptagon/index.html.md`
  - Enterprise bot solution
  
- **Playnext Lab**: `technicalcase/playnext-lab/index.html.md`
  - Gaming/entertainment bot
  
- **Resortbaito Dive**: `technicalcase/resortbaito-dive/index.html.md`
  - Tourism/hospitality bot
  
- **Skillbox**: `technicalcase/skillbox/index.html.md`
  - Education platform bot
  
- **Softbank**: `technicalcase/softbank/index.html.md`
  - Corporate customer service bot

Case study HTML files (summary pages):
- `technicalcase/boldly.html`
- `technicalcase/evolany-ai.html`
- `technicalcase/heptagon.html`
- `technicalcase/playnext-lab.html`
- `technicalcase/resortbaito-dive.html`
- `technicalcase/skillbox.html`
- `technicalcase/softbank.html`

---

## 📄 Main Documentation Pages

Root-level HTML files (overview/landing pages):
- `index.html` - Main documentation index
- `overview.html` - Messaging API overview
- `actions.html` - Actions overview
- `building-bot.html` - Bot building overview
- `message-types.html` - Message types overview
- `sending-messages.html` - Sending messages overview
- `receiving-messages.html` - Receiving messages overview
- `using-flex-messages.html` - Flex Messages overview
- `using-rich-menus.html` - Rich Menus overview
- `using-quick-reply.html` - Quick Reply overview
- `using-beacons.html` - Beacons overview
- `using-audience.html` - Audience overview
- `group-chats.html` - Group chats overview
- `linking-accounts.html` - Account linking overview
- `verify-webhook-signature.html` - Signature verification overview
- And many more...

---

## 🎯 Quick Reference by Task

### For Beginners
1. Start with: `getting-started/index.html.md`
2. Then: `building-bot/index.html.md`
3. Learn basics: `message-types/index.html.md`
4. Try examples: `nodejs-sample/index.html.md`

### For Sending Messages
- Reply: `sending-messages/index.html.md` (Reply Messages section)
- Push: `sending-messages/index.html.md` (Push Messages section)
- Broadcast: `sending-messages/index.html.md` (Broadcast section)
- Targeted: `sending-messages/index.html.md` (Narrowcast section)

### For Rich UI
- Flex Messages: `using-flex-messages/index.html.md` + `flex-message-elements/index.html.md`
- Quick Replies: `using-quick-reply/index.html.md`
- Rich Menus: `using-rich-menus/index.html.md`
- Templates: `message-types/index.html.md` (Template Messages section)

### For Security
- Verify webhooks: `verify-webhook-signature/index.html.md`
- Secure communication: `secure-message-sample/index.html.md`
- SSL/TLS: `ssl-tls-spec-of-the-webhook-source/index.html.md`

### For Groups
- Group management: `group-chats/index.html.md`
- Get members: `getting-user-ids/index.html.md`

### For Analytics
- Track impressions: `measure-impressions/index.html.md`
- Check errors: `check-webhook-error-statistics/index.html.md`
- View stats: `unit-based-statistics-aggregation/index.html.md`

### For Advanced Features
- Beacons: `using-beacons/index.html.md`
- Account linking: `linking-accounts/index.html.md`
- Coupons: `send-coupons-to-users/index.html.md`
- Loading indicator: `use-loading-indicator/index.html.md`

---

## 📊 File Organization Summary

**Total directories**: ~50 topic directories  
**Total markdown files**: ~70 detailed guides  
**Total HTML files**: ~60 overview pages  
**Case studies**: 7 detailed examples  

**Primary format**: Markdown (`index.html.md`) - contains full documentation  
**Secondary format**: HTML (`.html`) - summary/landing pages  

All files located in: `downloaded_docs/ja/docs/messaging-api/`

---

## 🔍 How to Use This Index

1. **Find by topic**: Browse the categorized sections above
2. **Find by task**: Use "Quick Reference by Task" section
3. **Direct access**: Copy the file path and read with:
   ```bash
   cat downloaded_docs/ja/docs/messaging-api/{path}
   ```
4. **Search content**: Use grep to find specific terms across all docs:
   ```bash
   grep -r "search term" downloaded_docs/ja/docs/messaging-api/
   ```

---

**Note**: All documentation is in Japanese. The skill provides English guidance while referencing these Japanese documents for detailed specifications.
