# eSales eCommerce API

A Node.js REST API for an eCommerce checkout flow simulation built as a coding assignment.

## Features

- **Product Management**: Get product details with variants (colors, sizes)
- **Shopping Cart**: Add, update, remove items from cart
- **Order Processing**: Create orders with payment simulation
- **Payment Simulation**: Test approved, declined, and gateway error scenarios
- **Email Notifications**: Automated emails using Mailgun for order confirmations
- **User Authentication**: BetterAuth integration with MongoDB
- **Data Validation**: Joi schema validation for all endpoints
- **Rate Limiting**: Protection against API abuse
- **Error Handling**: Centralized error management

## Tech Stack

- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session storage and caching
- **Authentication**: BetterAuth
- **Email Service**: Mailgun (replaces Mailtrap as specified)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston with custom Morgan middleware

## Payment Simulation

The API simulates three payment scenarios:

1. **Approved (`paid`)**: Order confirmed, inventory updated, success email sent
2. **Declined (`failed`)**: Order cancelled, failure email sent
3. **Gateway Error (`pending`)**: Order marked as pending

## Email Templates

The system sends formatted HTML emails via Mailgun for:

- **Order Confirmation**: Detailed order summary with items and customer info
- **Payment Failed**: Professional failure notification with retry instructions
- **Welcome Email**: Sent to new users upon registration

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route handlers
├── middlewares/    # Custom middleware
├── models/         # Database schemas
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── validations/    # Input validation schemas
```
