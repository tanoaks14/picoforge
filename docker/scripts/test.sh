#!/bin/bash
# Run all PicoForge tests inside Docker container

set -e

cd /workspace/pico-forge/build

echo "========================================"
echo "Running Unit Tests"
echo "========================================"
./pico-forge-tests

echo ""
echo "========================================"
echo "Running Integration Tests"
echo "========================================"
./pico-forge-integration-tests

echo ""
echo "✅ All tests passed!"
