SHELL := fish
.SHELLFLAGS := -c

.PHONY: help build build-client build-extension build-server dev dev-client dev-extension dev-server clean

help:
	@echo "Portico Build System"
	@echo ""
	@echo "Production Build:"
	@echo "  make build              - Build all (client, extension, server)"
	@echo ""
	@echo "Development (Watch Mode):"
	@echo "  make dev                - Run all in watch mode (requires tmux)"
	@echo "  make dev-client         - Watch client with Vite"
	@echo "  make dev-extension      - Watch extension"
	@echo "  make dev-server         - Watch server with air"
	@echo ""
	@echo "Individual Builds:"
	@echo "  make build-client       - Build client production bundle"
	@echo "  make build-extension    - Build extension"
	@echo "  make build-server       - Build server binary (requires client built)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean              - Remove all build artifacts"

# ============================================================================
# PRODUCTION BUILD
# ============================================================================

build: clean build-client build-extension build-server
	@echo "✓ All builds complete!"

build-client:
	@echo "Building client..."
	cd client && bun run build
	@echo "✓ Client built to client/dist/"

build-extension:
	@echo "Building extension..."
	cd extension && bun run build
	@echo "✓ Extension built to extension/dist/"

build-server: build-client
	@echo "Building server..."
	cd server && go build -o server ./cmd/server
	@echo "✓ Server built to server/server"

# ============================================================================
# DEVELOPMENT (WATCH MODE)
# ============================================================================

dev:
	@echo "Starting development mode (requires tmux)..."
	@which tmux > /dev/null || { echo "Error: tmux is required for watch mode"; exit 1; }
	@tmux new-session -d -s portico -x 200 -y 50
	@tmux send-keys -t portico "cd /home/sjsanc/work/portico && make dev-server" Enter
	@tmux split-window -t portico -h
	@tmux send-keys -t portico "cd /home/sjsanc/work/portico && make dev-client" Enter
	@tmux split-window -t portico -v
	@tmux send-keys -t portico "cd /home/sjsanc/work/portico && make dev-extension" Enter
	@tmux attach-session -t portico

dev-client:
	cd client && bun run dev

dev-extension:
	cd extension && bun run dev

dev-server:
	@if not command -v air &> /dev/null; echo "Installing air..."; go install github.com/air-verse/air@latest; end
	cd server && air

# ============================================================================
# CLEANUP
# ============================================================================

clean:
	@echo "Cleaning build artifacts..."
	rm -rf client/dist
	rm -rf extension/dist
	rm -f server/server
	@echo "✓ Cleanup complete"
