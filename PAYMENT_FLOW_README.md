# Payment Flow Implementation

This document describes the complete payment flow implementation for the FXCHubs platform, allowing users to select plans and pay using any of the integrated payment gateways.

## 🎯 Overview

The payment flow consists of:
1. **Plan Selection** - Users choose from available subscription plans
2. **Payment Gateway Selection** - Users select a compatible payment gateway
3. **Payment Method Selection** - Users choose a payment method (card, bank transfer, crypto, etc.)
4. **Payment Processing** - Users are redirected to the payment gateway
5. **Payment Verification** - Backend verifies payment and activates subscription

## 📁 File Structure

```
frontend/src/
├── components/
│   └── PlanSelectionAndPayment.tsx    # Main payment flow component
├── hooks/
│   └── usePaymentGateways.ts          # Custom hook for payment gateway management
├── app/
│   ├── subscribe/
│   │   └── page.tsx                   # Subscription page
│   └── payment/
│       └── callback/
│           └── page.tsx               # Payment callback page
└── PAYMENT_FLOW_README.md             # This documentation
```

## 🚀 Quick Start

### 1. Navigate to Subscription Page

Users can access the payment flow by navigating to:
```
/subscribe
```

### 2. Authentication Required

The subscription page requires authentication. If not logged in, users will be redirected to:
```
/auth/login?redirect=/subscribe
```

### 3. Complete Payment Flow

1. **Select a Plan** - Choose from available subscription plans
2. **Choose Payment Gateway** - Select from compatible payment gateways
3. **Select Payment Method** - Choose payment method (card, bank transfer, etc.)
4. **Review & Pay** - Review payment summary and proceed to payment
5. **Complete Payment** - Redirected to payment gateway
6. **Return & Verify** - Return to callback page for payment verification

## 🎨 Components

### PlanSelectionAndPayment Component

The main component that handles the entire payment flow.

**Features:**
- ✅ Plan selection with features display
- ✅ Payment gateway compatibility checking
- ✅ Payment method selection
- ✅ Real-time processing fee calculation
- ✅ Payment summary with total amount
- ✅ Loading states and error handling
- ✅ Responsive design

**Props:** None (self-contained)

**Usage:**
```tsx
import PlanSelectionAndPayment from '@/components/PlanSelectionAndPayment'

export default function SubscribePage() {
  return <PlanSelectionAndPayment />
}
```

### usePaymentGateways Hook

Custom hook for managing payment gateway data and operations.

**Features:**
- ✅ Fetch active payment gateways
- ✅ Gateway compatibility checking
- ✅ Processing fee calculation
- ✅ Payment method mapping
- ✅ Gateway icons and display names

**Usage:**
```tsx
import { usePaymentGateways } from '@/hooks/usePaymentGateways'

const {
  gateways,
  isLoading,
  getCompatibleGateways,
  calculateProcessingFee,
  getPaymentMethods
} = usePaymentGateways()
```

## 🔧 API Endpoints

### Required Backend Endpoints

1. **GET /api/plans** - Fetch available plans
2. **GET /api/payment-gateways** - Fetch active payment gateways
3. **POST /api/subscribe** - Create subscription and initiate payment
4. **POST /api/payment/verify** - Verify payment status

### Example API Responses

**Plans Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Premium Plan",
      "description": "Full access to all features",
      "price": 5000,
      "currency": "NGN",
      "duration": "MONTHLY",
      "features": ["Feature 1", "Feature 2"],
      "isActive": true
    }
  ]
}
```

**Payment Gateways Response:**
```json
[
  {
    "id": "1",
    "gateway": "FLUTTERWAVE",
    "display_name": "Flutterwave Payment",
    "description": "Pay with cards, bank transfer, or mobile money",
    "is_active": true,
    "supported_currencies": ["USDT", "USD", "EUR"],
    "min_amount": 100,
    "max_amount": 1000000,
    "processing_fee": 2.5
  }
]
```

## 🎯 Payment Flow Steps

### Step 1: Plan Selection
- Display all active plans in a grid layout
- Show plan name, price, duration, and features
- Allow user to select a plan

### Step 2: Payment Gateway Selection
- Filter gateways based on plan currency and amount
- Show gateway compatibility (supported currencies, min/max amounts)
- Display processing fees for each gateway

### Step 3: Payment Method Selection
- Show available payment methods for selected gateway
- Include method descriptions and icons
- Allow user to select preferred payment method

### Step 4: Payment Summary
- Display plan details
- Show processing fee calculation
- Display total amount to be paid
- Provide proceed to payment button

### Step 5: Payment Processing
- Call `/api/subscribe` endpoint
- Redirect to payment gateway URL
- Show loading state during processing

### Step 6: Payment Verification
- Handle return from payment gateway
- Verify payment status with backend
- Show success/failure message
- Redirect to dashboard on success

## 🎨 UI/UX Features

### Visual Design
- **Dark Theme** - Consistent with platform design
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Progress Indicators** - Clear step-by-step flow
- **Loading States** - Smooth user experience
- **Error Handling** - Clear error messages and recovery options

### User Experience
- **Intuitive Flow** - Logical step progression
- **Real-time Validation** - Immediate feedback on selections
- **Clear Pricing** - Transparent fee calculations
- **Multiple Options** - Various payment methods available
- **Secure Process** - HTTPS and proper authentication

## 🔒 Security Features

### Authentication
- Token-based authentication required
- Automatic redirect to login if not authenticated
- Secure token storage in localStorage

### Payment Security
- HTTPS communication with payment gateways
- Payment verification on backend
- Secure callback handling
- No sensitive data stored in frontend

## 🛠️ Customization

### Adding New Payment Gateways

1. **Update Backend:**
   - Add gateway configuration in database
   - Implement gateway-specific payment logic

2. **Update Frontend:**
   - Add gateway icon in `usePaymentGateways` hook
   - Add payment methods for new gateway
   - Update gateway compatibility logic

### Styling Customization

The components use Tailwind CSS classes and can be customized by:
- Modifying the component styles
- Updating the color scheme
- Adjusting layout and spacing
- Adding custom animations

## 🐛 Troubleshooting

### Common Issues

1. **Payment Gateway Not Showing**
   - Check if gateway is active in admin panel
   - Verify currency and amount compatibility
   - Check network connectivity

2. **Payment Verification Fails**
   - Verify webhook configuration
   - Check payment gateway credentials
   - Review server logs for errors

3. **Authentication Issues**
   - Ensure user is logged in
   - Check token validity
   - Verify API endpoint accessibility

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'payment-flow')
```

## 📱 Mobile Responsiveness

The payment flow is fully responsive and optimized for:
- **Desktop** - Full layout with side-by-side options
- **Tablet** - Adjusted grid layouts
- **Mobile** - Stacked layout with touch-friendly buttons

## 🚀 Performance

### Optimization Features
- **Lazy Loading** - Components load only when needed
- **Caching** - Payment gateway data cached in hook
- **Minimal Re-renders** - Efficient state management
- **Optimized Images** - SVG icons and optimized assets

## 📋 Testing

### Manual Testing Checklist
- [ ] Plan selection works correctly
- [ ] Payment gateway filtering works
- [ ] Payment method selection functions
- [ ] Processing fee calculation is accurate
- [ ] Payment redirect works
- [ ] Callback verification functions
- [ ] Error handling displays properly
- [ ] Mobile responsiveness works
- [ ] Authentication flow functions

### Automated Testing
```bash
# Run component tests
npm test PlanSelectionAndPayment

# Run payment flow tests
npm test payment-flow
```

## 🔄 Updates and Maintenance

### Regular Maintenance
- Update payment gateway configurations
- Monitor payment success rates
- Update supported currencies and methods
- Review and update security measures

### Version Updates
- Keep payment gateway SDKs updated
- Update component dependencies
- Review and update API endpoints
- Test payment flow after updates

## 📞 Support

For issues or questions about the payment flow:
1. Check this documentation
2. Review the troubleshooting section
3. Check server logs for backend issues
4. Contact the development team

---

**Last Updated:** January 2025
**Version:** 1.0.0 