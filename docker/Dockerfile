# Multi-stage Dockerfile for PicoForge production builds
# Stage 1: Build environment with Pico SDK
# Stage 2: Runtime with built artifacts

FROM debian:bookworm-slim AS builder

ENV DEBIAN_FRONTEND=noninteractive
ENV PICO_SDK_PATH=/opt/pico-sdk

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    python3 \
    gcc-arm-none-eabi \
    libnewlib-arm-none-eabi \
    libstdc++-arm-none-eabi-newlib \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Clone Pico SDK (shallow clone)
RUN git clone --depth 1 --branch master https://github.com/raspberrypi/pico-sdk.git ${PICO_SDK_PATH} && \
    cd ${PICO_SDK_PATH} && \
    git submodule update --init --depth 1

# Set up workspace
WORKDIR /workspace

# Copy source code
COPY pico-forge/ /workspace/pico-forge/

# Build PicoForge CLI and tests
RUN cd /workspace/pico-forge && \
    mkdir -p build && \
    cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make -j$(nproc)

# Stage 2: Runtime image
FROM debian:bookworm-slim AS runtime

ENV PICO_SDK_PATH=/opt/pico-sdk

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    gcc-arm-none-eabi \
    libnewlib-arm-none-eabi \
    libusb-1.0-0-dev \
    pkg-config \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy Pico SDK from builder
COPY --from=builder ${PICO_SDK_PATH} ${PICO_SDK_PATH}

# Copy built binaries
COPY --from=builder /workspace/pico-forge/build/pico-forge /usr/local/bin/
COPY --from=builder /workspace/pico-forge/build/pico-forge-tests /usr/local/bin/
COPY --from=builder /workspace/pico-forge/build/pico-forge-integration-tests /usr/local/bin/

WORKDIR /project

CMD ["/usr/local/bin/pico-forge"]
