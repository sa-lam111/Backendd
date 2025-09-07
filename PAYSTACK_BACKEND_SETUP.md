# Paystack Backend Integration Guide

## 🎯 **Backend vs Frontend Responsibilities**

### **Backend (Your Project) - What You're Building:**
- ✅ **Payment Initialization** - Create payment requests
- ✅ **Payment Verification** - Verify completed payments  
- ✅ **Order Management** - Handle order status updates
- ✅ **Webhook Processing** - Handle Paystack notifications
- ✅ **API Endpoints** - Provide payment data to frontend
- ✅ **Email Notifications** - Send payment confirmations

### **Frontend (Separate Project) - What Frontend Developer Will Build:**
- 🔗 **Payment UI** - Show payment buttons/forms
- 🔗 **Redirect Handling** - Handle Paystack redirects
- 🔗 **User Interface** - Display payment status
- 🔗 **API Calls** - Call your backend endpoints

## 🚀 **Paystack Developer Account Setup**

### **Step 1: Create Paystack Account**
1. Go to [https://paystack.com](https://paystack.com)
2. Click "Sign Up" and create your account
3. Complete the verification process

### **Step 2: Get API Keys**
1. Login to your Paystack dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Test Secret Key** (starts with `sk_test_`)
4. Copy your **Test Public Key** (starts with `pk_test_`)

### **Step 3: Environment Variables**
Add these to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_CALLBACK_URL=http://localhost:3001/orders/verify

# Existing variables
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
MONGO_URL=your_mongodb_connection_string
PORT=3001
```

## 📋 **Backend API Endpoints**

### **1. Create Order & Initialize Payment**
```http
POST /orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id_here",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "zipCode": "100001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created and payment initialized",
  "data": {
    "order": { ... },
    "payment": {
      "authorization_url": "https://checkout.paystack.com/...",
      "access_code": "access_code_here",
      "reference": "order_1234567890_abc123"
    }
  }
}
```

### **2. Verify Payment (Frontend calls this after payment)**
```http
GET /orders/verify/{reference}
```

### **3. Handle Webhook (Paystack calls this)**
```http
POST /orders/webhook
Content-Type: application/json
X-Paystack-Signature: signature_here

{
  "event": "charge.success",
  "data": { ... }
}
```

### **4. Get User Orders**
```http
GET /orders/my-orders
Authorization: Bearer <user_token>
```

### **5. Get Single Order**
```http
GET /orders/{order_id}
Authorization: Bearer <user_token>
```

### **6. Update Order Status**
```http
PATCH /orders/{order_id}/status
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "status": "Shipped"
}
```

## 🔄 **Payment Flow**

1. **Frontend** → `POST /orders` → **Backend creates order & payment**
2. **Backend** → Returns `authorization_url` to **Frontend**
3. **Frontend** → Redirects user to Paystack checkout
4. **User** → Completes payment on Paystack
5. **Paystack** → Calls `POST /orders/webhook` → **Backend processes payment**
6. **Frontend** → Calls `GET /orders/verify/{reference}` → **Backend verifies payment**
7. **Backend** → Updates order status & sends email

## 🧪 **Testing Your Backend**

### **Test Order Creation:**
```bash
# Start your server
npm start

# Create order (replace with actual product ID and user token)
curl -X POST http://localhost:3001/orders \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "PRODUCT_ID_HERE",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Test Street",
      "city": "Lagos",
      "state": "Lagos",
      "zipCode": "100001"
    }
  }'
```

### **Test Payment Verification:**
```bash
# After payment, verify with reference
curl -X GET http://localhost:3001/orders/verify/order_1234567890_abc123
```

## 🔧 **Webhook Setup (Important for Production)**

1. **In Paystack Dashboard:**
   - Go to **Settings** → **Webhooks**
   - Add webhook URL: `https://yourdomain.com/orders/webhook`
   - Select events: `charge.success`, `charge.failed`

2. **For Local Testing:**
   - Use ngrok to expose your local server
   - Set webhook URL to your ngrok URL

## 📧 **Email Integration**

The system automatically sends:
- **Payment confirmation** when payment is successful
- **Order status updates** when status changes

## 🛡️ **Security Features**

- **Webhook signature verification** - Ensures webhooks are from Paystack
- **Payment verification** - Double-checks payment status
- **Stock validation** - Prevents overselling
- **User authentication** - Protects order endpoints

## 🚨 **Important Notes**

1. **Test Mode**: Use test keys for development
2. **Webhooks**: Essential for production - handle payment notifications
3. **Error Handling**: All payment errors are logged
4. **Stock Management**: Stock is updated after successful payment
5. **Email Notifications**: Automatic confirmations sent

## 🔧 **Troubleshooting**

### **Common Issues:**
- **Invalid API Key**: Check your secret key in `.env`
- **Payment Failed**: Verify Paystack account status
- **Order Not Found**: Check order reference
- **Webhook Not Working**: Check webhook URL and signature verification

### **Debug Mode:**
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 🎯 **What Frontend Developer Needs:**

Share these with your frontend developer:

1. **API Base URL**: `http://localhost:3001` (or your production URL)
2. **Endpoints**: All the endpoints listed above
3. **Authentication**: How to get user tokens
4. **Payment Flow**: The flow described above
5. **Error Handling**: How to handle API errors

Your backend is now ready to handle Paystack payments! The frontend developer will use your API endpoints to create a payment interface.
