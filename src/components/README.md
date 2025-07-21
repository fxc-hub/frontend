# Dashboard Components

This directory contains reusable components for the dashboard functionality.

## New Components

### SubscriptionStatusBadge
Displays trial and grace period status with remaining days.

**Props:**
- `isTrial?: boolean` - Whether the subscription is in trial period
- `isGrace?: boolean` - Whether the subscription is in grace period
- `trialEndsAt?: string` - Trial end date
- `graceEndsAt?: string` - Grace period end date
- `remainingDays?: number` - Days remaining (optional, will calculate from end date if not provided)

**Usage:**
```tsx
<SubscriptionStatusBadge
  isTrial={user.subscription.is_trial}
  isGrace={user.subscription.is_grace}
  trialEndsAt={user.subscription.trial_ends_at}
  graceEndsAt={user.subscription.grace_ends_at}
  remainingDays={user.subscription.remaining_days}
/>
```

### SubscriptionHistoryTable
Displays a table of subscription history with plan details, status, and dates.

**Props:**
- `subscriptions: Subscription[]` - Array of subscription objects
- `getStatusColor: (status: string) => string` - Function to get status color classes

**Usage:**
```tsx
<SubscriptionHistoryTable
  subscriptions={subscriptionHistory}
  getStatusColor={getStatusColor}
/>
```

### PaymentHistoryTable
Displays a table of payment history with amount, status, and payment details.

**Props:**
- `payments: Payment[]` - Array of payment objects
- `getStatusColor: (status: string) => string` - Function to get status color classes

**Usage:**
```tsx
<PaymentHistoryTable
  payments={paymentHistory}
  getStatusColor={getStatusColor}
/>
```

## Utility Functions

The components use utility functions from `@/lib/utils`:

- `formatDate(dateString)` - Format date to readable string
- `formatCurrencyAmount(amount, currency)` - Format currency with symbol
- `getStatusColor(status)` - Get CSS classes for status badges
- `getDaysRemaining(endDate)` - Calculate days remaining until end date

## Styling

All components use Tailwind CSS classes and follow the dark theme design:
- Background: `bg-gray-900` for containers, `bg-gray-800` for cards
- Text: `text-white` for primary text, `text-gray-300` for secondary text
- Borders: `border-gray-700` for dividers
- Status colors: Green for active/success, yellow for pending, red for failed/cancelled, orange for suspended

## Data Interfaces

The components expect data structures that match the backend API responses:

```tsx
interface Subscription {
  id: number
  plan_id: number
  status: string
  started_at: string
  trial_ends_at?: string
  ends_at: string
  grace_ends_at?: string
  auto_renew: boolean
  amount_paid: number
  currency: string
  is_trial?: boolean
  is_grace?: boolean
  plan: Plan
}

interface Payment {
  id: number
  amount: number
  currency: string
  status: string
  payment_method: string
  payment_provider: string
  payment_reference: string
  paid_at?: string
  description?: string
}
``` 