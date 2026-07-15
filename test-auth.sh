#!/bin/bash

# Test Authentication Flow
# This script tests the CSRF token handling with the Laravel backend

BASE_URL="http://localhost:8000"
COOKIE_FILE="/tmp/auth-cookies.txt"

echo "======================================"
echo "Testing Platform Authentication Flow"
echo "======================================"
echo ""

# Clean up
rm -f "$COOKIE_FILE"

# Step 1: Get CSRF Cookie
echo "Step 1: Getting CSRF cookie..."
CSRF_RESPONSE=$(curl -s -c "$COOKIE_FILE" -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/sanctum/csrf-cookie")
CSRF_STATUS=$(echo "$CSRF_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$CSRF_STATUS" = "204" ]; then
  echo "✅ CSRF cookie request successful (HTTP 204)"
else
  echo "❌ CSRF cookie request failed (HTTP $CSRF_STATUS)"
  exit 1
fi

# Extract XSRF-TOKEN from cookies
XSRF_TOKEN=$(grep XSRF-TOKEN "$COOKIE_FILE" | awk '{print $7}')
if [ -z "$XSRF_TOKEN" ]; then
  echo "❌ XSRF-TOKEN not found in cookies"
  cat "$COOKIE_FILE"
  exit 1
fi

# URL decode the token
XSRF_TOKEN_DECODED=$(printf '%b' "${XSRF_TOKEN//%/\\x}")
echo "✅ XSRF-TOKEN extracted: ${XSRF_TOKEN_DECODED:0:20}..."
echo ""

# Step 2: Login
echo "Step 2: Attempting login..."
LOGIN_RESPONSE=$(curl -s -b "$COOKIE_FILE" -c "$COOKIE_FILE" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-XSRF-TOKEN: $XSRF_TOKEN_DECODED" \
  -X POST \
  -d '{"email":"super@test.com","password":"password"}' \
  -w "\nHTTP_STATUS:%{http_code}" \
  "$BASE_URL/api/v1/platform/auth/login")

LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_STATUS" = "200" ]; then
  echo "✅ Login successful (HTTP 200)"
  echo ""
  echo "Response data:"
  echo "$LOGIN_BODY" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_BODY"
  echo ""
elif [ "$LOGIN_STATUS" = "419" ]; then
  echo "❌ Login failed with CSRF token mismatch (HTTP 419)"
  echo "Response: $LOGIN_BODY"
  exit 1
else
  echo "❌ Login failed (HTTP $LOGIN_STATUS)"
  echo "Response: $LOGIN_BODY"
  exit 1
fi

# Step 3: Get authenticated user
echo "Step 3: Getting authenticated user..."
ME_RESPONSE=$(curl -s -b "$COOKIE_FILE" \
  -H "Accept: application/json" \
  -w "\nHTTP_STATUS:%{http_code}" \
  "$BASE_URL/api/v1/platform/auth/me")

ME_STATUS=$(echo "$ME_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
ME_BODY=$(echo "$ME_RESPONSE" | sed '$d')

if [ "$ME_STATUS" = "200" ]; then
  echo "✅ Auth verification successful (HTTP 200)"
  echo ""
  echo "User data:"
  echo "$ME_BODY" | python3 -m json.tool 2>/dev/null || echo "$ME_BODY"
  echo ""
elif [ "$ME_STATUS" = "401" ]; then
  echo "❌ Auth verification failed - Not authenticated (HTTP 401)"
  exit 1
else
  echo "❌ Auth verification failed (HTTP $ME_STATUS)"
  exit 1
fi

# Step 4: Logout
echo "Step 4: Logging out..."
LOGOUT_RESPONSE=$(curl -s -b "$COOKIE_FILE" \
  -H "Accept: application/json" \
  -H "X-XSRF-TOKEN: $XSRF_TOKEN_DECODED" \
  -X POST \
  -w "\nHTTP_STATUS:%{http_code}" \
  "$BASE_URL/api/v1/platform/auth/logout")

LOGOUT_STATUS=$(echo "$LOGOUT_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$LOGOUT_STATUS" = "200" ] || [ "$LOGOUT_STATUS" = "204" ]; then
  echo "✅ Logout successful (HTTP $LOGOUT_STATUS)"
else
  echo "❌ Logout failed (HTTP $LOGOUT_STATUS)"
  exit 1
fi

echo ""
echo "======================================"
echo "✅ All authentication tests passed!"
echo "======================================"
echo ""
echo "The backend authentication is working correctly."
echo "You can now test the frontend at: http://localhost:3001/en/sign-in"
echo ""

# Clean up
rm -f "$COOKIE_FILE"
