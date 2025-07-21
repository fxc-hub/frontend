# Frontend Setup Guide

## Environment Configuration

Create a `.env.local` file in the frontend directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

The frontend now correctly calls these backend endpoints:

- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login` (email or phone)
- **Logout**: `POST /api/auth/logout`
- **User Profile**: `GET /api/user`
- **Forgot Password**: `POST /api/auth/forgot-password`
- **Email Verification**: `GET /email/verify/{id}/{hash}`

## Registration Form Fields

The registration form includes these fields:

- `first_name` (required)
- `last_name` (required)
- `email` (required)
- `phone` (optional)
- `password` (required)
- `password_confirmation` (required)
- `role` (automatically set to "trader")

## Features

✅ **Correct API endpoints** - matches backend routes  
✅ **Automatic role assignment** - defaults to "trader"  
✅ **Validation error handling** - displays backend validation errors  
✅ **Automatic name generation** - backend creates full name from first/last  
✅ **Success page** - shows after registration with email verification instructions
✅ **Welcome email** - sent automatically after registration with verification link
✅ **Email verification** - required before login with beautiful verification page
✅ **Login with email or phone** - flexible login options
✅ **Token-based authentication** - stores token in localStorage  

## Testing

1. Start your Laravel backend: `php artisan serve`
2. Start your Next.js frontend: `npm run dev`
3. Navigate to `/auth/register`
4. Fill out the form and submit
5. You'll be redirected to `/auth/register/success` page
6. Check your Mailtrap inbox for the welcome email

## Troubleshooting

If registration fails:

1. **Check browser console** for network errors
2. **Verify backend is running** on port 8000
3. **Check Laravel logs** for backend errors
4. **Verify Mailtrap configuration** in backend `.env`
5. **Clear browser cache** and try again 