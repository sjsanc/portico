SHELL := fish
.SHELLFLAGS := -c

.PHONY: help build build-client build-extension build-server dev dev-client dev-extension dev-server clean install

help:
	@echo "Portico"
	@echo ""
	@echo "Build:"
	@echo "  make build              - Build all (client, extension, server)"
	@echo "  make build-client       - Build client production bundle"
	@echo "  make build-extension    - Build extension"
	@echo "  make build-server       - Build server binary"
	@echo "  make install            - Install as user systemd service"
	@echo ""
	@echo "Dev:"
	@echo "  make dev                - Run all in watch mode (requires tmux)"
	@echo "  make dev-client         - Watch client with Vite"
	@echo "  make dev-extension      - Watch extension"
	@echo "  make dev-server         - Watch server with air"
	@echo ""
	@echo "  make clean              - Remove all build artifacts"

# ============================================================================
# BUILD
# ============================================================================

build: clean build-client build-extension build-server

build-client:
	cd client && bun run build

build-extension:
	cd extension && bun run build

build-server: build-client
	cd server && go build -o server ./cmd/server

# ============================================================================
# DEVELOPMENT
# ============================================================================

dev:
	@which tmux > /dev/null || { echo "Error: tmux is required"; exit 1; }
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
	rm -rf client/dist extension/dist server/dist server/server

# ============================================================================
# SERVICE
# ============================================================================

install:
	@mkdir -p ~/.config/systemd/user
	@cp portico.service ~/.config/systemd/user/
	@systemctl --user daemon-reload
	@systemctl --user enable --now portico
	@echo "Service installed and started. Use 'systemctl --user status portico' to check."
