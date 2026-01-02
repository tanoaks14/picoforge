#!/bin/bash
# Build PicoForge inside Docker container

set -e

echo "Building PicoForge in Docker..."

cd /workspace/pico-forge

# Create build directory
mkdir -p build
cd build

# Configure with CMake
echo "Configuring with CMake..."
cmake .. -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE:-Release} -G Ninja

# Build
echo "Building..."
ninja -j$(nproc)

echo "✅ Build complete!"
echo "Binaries available in /workspace/pico-forge/build/"
