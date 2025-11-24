REPO       := bb-alfred-typescript
REPO_OWNER := gnirbnelliw
GIT        := /usr/bin/git
NVM_DIR    := $(HOME)/.nvm

.DEFAULT_GOAL := setup

setup:
	# -----------------------------------------------
	@echo "🔥 Generating .env file from Alfred config.."
	# -----------------------------------------------
	@printf "%s\n" "# Auto-generated on $(shell date)" \
	"SERVER_PORT=$(SERVER_PORT)" \
	"HOST=$(HOST)" \
	"GITHUB_TOKEN=$(GITHUB_TOKEN)" \
	"LINEAR_API_KEY=$(LINEAR_API_KEY)" \
	"TESTMO_API_KEY=$(TESTMO_API_KEY)" \
	"NOTION_API_KEY=$(NOTION_API_KEY)" \
	"OPENAI_KEY=$(OPENAI_KEY)" \
	"ALFRED_KEY_SEQUENCE=$(ALFRED_KEY_SEQUENCE)" \
	"WORKFLOW_PATH=$(WORKFLOW_PATH)" \
	> .env

	@echo "Done."

	# -----------------------------------------------
	@echo "🔥 Generating config.json for workflow variables…"
	# -----------------------------------------------
	@rm -f config.json

	@echo "{"                                  >  config.json

	# ---------- Alfred workflow vars ----------
	
	@echo "  \"ALFRED_WORKFLOW_BUNDLEID\": \"$(alfred_workflow_bundleid)\","   >> config.json
	@echo "  \"ALFRED_WORKFLOW_NAME\": \"$(alfred_workflow_name)\","   >> config.json
	@echo "  \"ALFRED_WORKFLOW_DESCRIPTION\": \"$(alfred_workflow_description)\","   >> config.json
	@echo "  \"ALFRED_WORKFLOW_UID\": \"$(alfred_workflow_uid)\","   >> config.json
	@echo "  \"ALFRED_WORKFLOW_DATA\": \"$(alfred_workflow_data)\","   >> config.json
	@echo "  \"ALFRED_KEY_SEQUENCE\": \"$(ALFRED_KEY_SEQUENCE)\","      >> config.json
	@echo "  \"WORKFLOW_PATH\": \"$(WORKFLOW_PATH)\","      >> config.json

	# ---------- Repo and web server vars ----------

	@echo "  \"REPO_OWNER\": \"$(REPO_OWNER)\","      >> config.json
	@echo "  \"REPO_NAME\": \"$(REPO_NAME)\","      >> config.json
	@echo "  \"SERVER_PORT\": \"$(SERVER_PORT)\","      >> config.json
	@echo "  \"HOST\": \"$(HOST)\","      >> config.json

	# ---------- API Tokens ----------

	@echo "  \"GITHUB_TOKEN\": \"$(GITHUB_TOKEN)\","      >> config.json
	@echo "  \"LINEAR_API_KEY\": \"$(LINEAR_API_KEY)\","  >> config.json
	@echo "  \"OPENAI_KEY\": \"$(OPENAI_KEY)\","          >> config.json
	@echo "  \"TESTMO_API_KEY\": \"$(TESTMO_API_KEY)\","  >> config.json
	@echo "  \"NOTION_API_KEY\": \"$(NOTION_API_KEY)\""   >> config.json
	@echo "}"                                  >> config.json


	# -----------------------------------------------
	@echo "🔥 Dumping environment to printenv.txt..."
	# -----------------------------------------------
	@printenv > printenv.txt
	@echo "Dumped environment to printenv.txt..."

	# -----------------------------------------------
	@echo "🔥 Ensure repo exists..."
	# -----------------------------------------------
	@if [ ! -d "$(REPO)" ]; then \
		echo "⚠️ Repo not found. Cloning..."; \
		$(GIT) clone https://github.com/$(REPO_OWNER)/$(REPO).git; \
	else \
		echo "📦 Repo exists. Skipping clone..."; \
	fi

	# -----------------------------------------------
	@echo "🔥 Copying config.json into repo..."
	# -----------------------------------------------

	@# Now copy config.json into into $(REPO)
	@cp config.json $(REPO)/config.json
	@echo "Done writing config to $(REPO)/config.json"

	# -----------------------------------------------
	# Conditional Git Sync
	# -----------------------------------------------
ifneq ($(shell echo "$(ACTION)" | tr '[:upper:]' '[:lower:]'),rebuild)
	@echo "🔥 Sync repo with latest main..."
	@cd $(REPO) && \
		$(GIT) fetch --all --prune && \
		$(GIT) reset --hard HEAD && \
		$(GIT) switch main && \
		$(GIT) log -5 --oneline
else
	@echo "🔧 Rebuild mode: skipping git sync and using existing changes..."
endif

	# -----------------------------------------------
	@echo "🔥 Place fresh .env file inside repo......"
	# -----------------------------------------------
	@mv .env $(REPO)/.env

	# -----------------------------------------------
	@echo "🔥 Set up Node environment..."
	# -----------------------------------------------
	@cd $(REPO); \
	if [ -s "$(NVM_DIR)/nvm.sh" ]; then \
		. "$(NVM_DIR)/nvm.sh"; \
		NODE_VERSION="$$(cat .nvmrc)"; \
		echo "Using Node version $$NODE_VERSION"; \
		nvm install "$$NODE_VERSION"; \
		nvm use "$$NODE_VERSION"; \
	else \
		echo "NVM not found — using Homebrew Node"; \
	fi; \

	# -----------------------------------------------
	@echo "🔥 Running yarn, biome format, and yarn build..."
	# -----------------------------------------------
	@cd $(REPO) && rm -rf dist && yarn && yarn build

	# -----------------------------------------------
	@echo "🔥 Reloading Alfred workflows..."
	# -----------------------------------------------
	@cd $(REPO) && touch dist/{index.js,cli.js,server.js}
	@echo "Touched files: dist/{index.js,cli.js,server.js}"

	# -----------------------------------------------
	@echo "🔥 Starting web server on port $(SERVER_PORT)..."
	# -----------------------------------------------
	# Kill server if running (robust)
	@lsof -ti tcp:$(SERVER_PORT) | xargs kill -9 || true

	# Start server fully detached
	@cd $(REPO) && \
	nohup node dist/cli.js --action home \
	> server.log 2>&1 & echo $$! > server.pid

	@echo "Server started on $(HOST):$(SERVER_PORT)"

	# -----------------------------------------------
	@echo "🔥 Setup complete. 🔥"
	# -----------------------------------------------