.PHONY: help build test dev clean docker-build docker-test docker-dev

help:
	@echo "PicoForge Development Commands"
	@echo ""
	@echo "Docker Commands (Recommended for Portability):"
	@echo "  make docker-build    - Build PicoForge in Docker"
	@echo "  make docker-test     - Run all tests in Docker"
	@echo "  make docker-dev      - Start interactive development container"
	@echo "  make clean           - Clean all build artifacts"
	@echo ""
	@echo "Development Workflow:"
	@echo "  1. make docker-build     # Build the project"
	@echo "  2. make docker-test      # Run tests"
	@echo "  3. make docker-dev       # Interactive development"

# Docker-based commands (portable across all platforms)
docker-build:
	@echo "Building PicoForge in Docker..."
	docker-compose build pico-forge-dev

docker-test:
	@echo "Running tests in Docker..."
	docker-compose up --abort-on-container-exit pico-forge-test

docker-dev:
	@echo "Starting development container..."
	docker-compose run --rm pico-forge-dev /bin/bash

docker-shell:
	@echo "Opening shell in existing dev container..."
	docker-compose exec pico-forge-dev /bin/bash

clean:
	@echo "Cleaning build artifacts..."
	docker-compose down -v
	rm -rf pico-forge/build
	@echo "✅ Clean complete"

# Quick test without rebuilding
quick-test:
	@echo "Running quick test (assumes container is built)..."
	docker-compose run --rm pico-forge-dev /bin/bash -c "\
		cd /workspace/pico-forge && \
		mkdir -p build && cd build && \
		cmake .. && make -j\$$(nproc) && \
		./pico-forge-tests && \
		./pico-forge-integration-tests"

# Build and test in one command
build-and-test: docker-build docker-test

# Development setup (first time)
setup:
	@echo "Setting up PicoForge development environment..."
	@echo "Checking Docker..."
	@docker --version || (echo "❌ Docker not found. Please install Docker first." && exit 1)
	@docker-compose --version || (echo "❌ Docker Compose not found. Please install Docker Compose first." && exit 1)
	@echo "✅ Docker is installed"
	@echo "Building development image..."
	docker-compose build pico-forge-dev
	@echo "✅ Setup complete! Run 'make docker-test' to verify."
