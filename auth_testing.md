# Auth Testing Playbook

## Admin Credentials
- Email: robokoshal@gmail.com
- Password: robo@KOSHAL()149#
- Role: super_admin

## API Endpoints
- POST /api/auth/login - Login with email/password, returns JWT token
- GET /api/auth/me - Get current user (requires Bearer token)
- POST /api/auth/register - Create new user (admin only)

## Test Steps
1. Login: POST /api/auth/login with admin credentials
2. Use returned access_token as Bearer token in Authorization header
3. Test /api/auth/me to verify token works
4. Test admin endpoints like /api/users (requires super_admin role)

## Bearer Token Usage
Add header: Authorization: Bearer <access_token>
