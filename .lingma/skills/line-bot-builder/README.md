# LINE Bot Builder Skill

A comprehensive skill for building LINE bots using the Messaging API with step-by-step guidance from official documentation.

## Overview

This skill provides structured guidance for creating production-ready LINE bots by leveraging the downloaded official LINE Messaging API documentation stored in `downloaded_docs/`.

## Skill Structure

```
line-bot-builder/
├── SKILL.md          # Main skill instructions (424 lines)
├── examples.md       # Detailed code examples and patterns
└── reference.md      # API endpoint reference and specifications
```

## What This Skill Does

### 🎯 Core Capabilities
- **Setup Guidance**: Walk through LINE Official Account creation and configuration
- **Webhook Handling**: Implement secure webhook signature verification
- **Message Types**: Send text, images, stickers, Flex Messages, templates, and more
- **Event Processing**: Handle message, follow, postback, and other webhook events
- **Advanced Features**: Rich menus, quick replies, audience targeting, group chats

### 📚 Documentation Coverage
The skill references comprehensive documentation covering:
- Getting started with Messaging API
- Building and configuring bots
- Sending and receiving messages
- All message types and their specifications
- Security best practices (signature verification)
- Advanced features (Flex Message, Rich Menus, Quick Reply)
- Group chat management
- Audience and narrowcast messaging

## When to Use This Skill

Use this skill when:
- Creating a new LINE bot from scratch
- Implementing webhook handlers for LINE Messaging API
- Adding specific message types (Flex Message, templates, etc.)
- Configuring rich menus or quick reply buttons
- Handling user interactions and conversation flows
- Debugging LINE API integration issues
- Learning LINE bot development best practices

## How to Use

### Basic Usage
Simply mention building a LINE bot or ask about specific LINE API features:

```
"Help me create a LINE bot that echoes messages"
"How do I send a Flex Message?"
"Set up webhook signature verification"
"Create a menu system with quick replies"
```

### Step-by-Step Development
The skill guides you through:
1. Setting up LINE Official Account and obtaining credentials
2. Configuring webhook endpoints with proper security
3. Implementing event handlers for different event types
4. Sending various message types with proper formatting
5. Adding advanced features as needed

### Code Examples
Access detailed implementation examples for:
- Complete webhook handlers (Cloudflare Workers compatible)
- All message type implementations
- User profile retrieval
- Group chat management
- Rich menu creation and management
- Error handling and retry logic
- Conversation state management

## Key Features

### 🔒 Security First
- Mandatory webhook signature verification
- HTTPS-only communication
- Secure credential handling
- Best practices for production deployment

### 📱 Comprehensive Message Support
- Text messages (with emojis and formatting)
- Sticker messages (with sticker ID reference)
- Image/Video/Audio messages
- Location messages
- Flex Messages (customizable layouts)
- Template messages (buttons, confirm, carousel)
- Quick reply buttons

### 🎨 Advanced UI Components
- Rich Menus (persistent bottom menu)
- Quick Replies (contextual action buttons)
- Flex Message layouts (CSS Flexbox-based)
- Interactive template messages

### 👥 Multi-User Support
- Individual user messaging
- Group chat management
- Room chat support
- Broadcast and multicast messaging
- Audience-based narrowcast

### 🛠️ Developer Tools
- API reference with all endpoints
- Error code documentation
- Rate limiting information
- Quota management guidance
- Troubleshooting tips

## Integration with Project

This skill is designed to work with the existing project structure:

- **Documentation**: Uses `downloaded_docs/ja/docs/messaging-api/` as reference
- **Implementation**: Compatible with existing `src/index.js` Cloudflare Worker
- **Configuration**: Works with `wrangler.toml` environment variables
- **Language**: JavaScript/Node.js examples

## Example Scenarios

### Scenario 1: Echo Bot
```
User: "Create a simple echo bot"
Skill: Provides complete webhook handler with signature verification 
       and text message echo functionality
```

### Scenario 2: Menu System
```
User: "Add a menu with quick replies"
Skill: Shows how to implement quick reply buttons with different 
       action types (message, URI, postback)
```

### Scenario 3: Product Catalog
```
User: "Send a product catalog with images"
Skill: Demonstrates Flex Message or Carousel Template implementation 
       with product cards
```

### Scenario 4: User Greeting
```
User: "Greet users when they follow the bot"
Skill: Implements follow event handler with personalized greeting 
       using user profile data
```

## Best Practices Included

✅ **Security**
- Signature verification on all webhooks
- Environment variable usage for secrets
- HTTPS enforcement

✅ **Performance**
- Async event processing
- Retry logic with exponential backoff
- Proper error handling

✅ **Maintainability**
- Clean code structure
- Modular event handlers
- Comprehensive logging

✅ **User Experience**
- Appropriate message types for context
- Quick replies for easy interaction
- Loading indicators for long operations

## References

All documentation referenced in this skill comes from the official LINE Messaging API documentation located in:
- `downloaded_docs/ja/docs/messaging-api/` - Original downloaded docs
- `cleaned_rag_docs/ja/docs/messaging-api/` - Cleaned versions for RAG

Key documents include:
- Getting Started Guide
- Building Bot Tutorial
- Message Type Specifications
- Webhook Event Documentation
- Flex Message Guide
- Rich Menu Implementation
- Security Guidelines

## Updates and Maintenance

To update this skill:
1. Re-download latest documentation if needed
2. Update examples based on new API features
3. Add new message types or endpoints as released
4. Revise best practices based on community feedback

## Related Files

- **Main Skill**: `.lingma/skills/line-bot-builder/SKILL.md`
- **Examples**: `.lingma/skills/line-bot-builder/examples.md`
- **API Reference**: `.lingma/skills/line-bot-builder/reference.md`
- **Current Implementation**: `src/index.js`
- **Project Config**: `wrangler.toml`, `package.json`

## Notes

- All examples are tested against current LINE Messaging API specifications
- Code samples use modern JavaScript (ES6+) compatible with Cloudflare Workers
- Documentation is in Japanese but skill provides English guidance
- Skill assumes basic knowledge of JavaScript and HTTP APIs

---

**Version**: 1.0  
**Last Updated**: 2024  
**Compatible With**: LINE Messaging API v2
