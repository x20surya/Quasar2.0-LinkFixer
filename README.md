# Quasar2.0-LinkFixer
 
 ## API ENDPOINTS FOR AUTH

 Register User

URL: POST /api/auth/register
Body:
{
  "email": "user@example.com",
  "password": "password123",
  "username" : "something"
}

Response: Returns JWT token and user data

Login User

URL: POST /api/auth/login
Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: Returns JWT token and user data

Resend Verification Email

URL: POST /api/auth/resend-verification
Body:
{
  "email": "user@example.com"
}

URL: POST /api/addWebsite
Body:
{
  "startURL" : "https://example.com"
}

URL: POST /api/getStatus
Body:
{
  "startURL" : "https://example.com",
  "auth" : "aoubfbau", (-> authentication token given by user for accessing their website <optional>)
  "pages" : "32" (-> number of pages in website <optional>)
}

Response: Sends a new verification email

Get User Data

URL: GET /api/auth/user
Headers: x-auth-token: your_jwt_token
Response: Returns the current user's data
