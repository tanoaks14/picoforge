#!/bin/bash

# Setup script for PicoForge Infrastructure

echo "Setting up PicoForge Infrastructure..."

# Create workspace directory if it doesn't exist
mkdir -p workspace

# Ensure scripts are executable
chmod +x infra/scripts/*.sh

echo "Infrastructure setup complete."
