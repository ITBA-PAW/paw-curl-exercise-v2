#!/bin/bash

# Test script for /styles endpoint
# Runs curl commands and checks expected status codes

# Base URL for the endpoint
BASE_URL="http://localhost:3000/styles"

# Counter for test results
PASSED=0
FAILED=0
TOTAL=0

# Function to run a test case
run_test() {
  local test_name="$1"
  local curl_cmd="$2"
  local expected_status="$3"
  local test_number=$((TOTAL + 1))

  echo "=== Test $test_number: $test_name ==="
  # Execute curl command and capture status code and response
  response=$(eval "$curl_cmd" 2>/dev/null)
  http_status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" -H "Content-Type: application/json" -d "$curl_cmd_data")

  echo "HTTP Status: $http_status"
  echo "Response: $response"
  echo

  # Check if status matches expected
  if [ "$http_status" = "$expected_status" ]; then
    echo "✅ Test $test_name: PASSED"
    ((PASSED++))
  else
    echo "❌ Test $test_name: FAILED (Expected $expected_status, got $http_status)"
    ((FAILED++))
  fi
  ((TOTAL++))
  echo
}

# Test 1: Valid CSS Input
curl_cmd_data='{"group": 1, "style": "color: blue; font-size: 16px;"}'
run_test "Valid CSS Input" "curl -s -X POST $BASE_URL -H 'Content-Type: application/json' -d '$curl_cmd_data'" "201"

# Test 2: Invalid CSS Input
curl_cmd_data='{"group": 1, "style": "color: blue; font-size: 16px; invalid-property;"}'
run_test "Invalid CSS Input" "curl -s -X POST $BASE_URL -H 'Content-Type: application/json' -d '$curl_cmd_data'" "400"

# Test 3: Restricted Property (transform)
curl_cmd_data='{"group": 1, "style": "transform: rotate(45deg);"}'
run_test "Restricted Property (transform)" "curl -s -X POST $BASE_URL -H 'Content-Type: application/json' -d '$curl_cmd_data'" "400"

# Test 4: Missing Body
curl_cmd_data=''
run_test "Missing Body" "curl -s -X POST $BASE_URL -H 'Content-Type: application/json'" "400"

# Test 5: Missing Group
curl_cmd_data='{"style": "body { color: blue; }"}'
run_test "Missing Group" "curl -s -X POST $BASE_URL -H 'Content-Type: application/json' -d '$curl_cmd_data'" "400"

# Test 6: Invalid Group (Non-Numeric)
curl_cmd_data='{"group": "invalid", "style": "color: blue;"}'
run_test "Invalid Group (Non-Numeric)" "curl -s -X POST $BASE_URL -H 'Content-Type: application/json' -d '$curl_cmd_data'" "400"

# Test 7: Missing Style
curl_cmd_data='{"group": 1}'
run_test "Missing Style" "curl -s -X POST $BASE_URL -H 'Content-Type: application/json' -d '$curl_cmd_data'" "400"

# Print summary
echo "=== Test Summary ==="
echo "Total Tests: $TOTAL"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
if [ $FAILED -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ Some tests failed."
fi