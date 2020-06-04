DOCKER_IMAGE?=opentutor-api

.PHONY: docker-build
docker-build:
	DOCKER_BUILDKIT=1 \
	docker build \
		--ssh default \
		-t $(DOCKER_IMAGE) \
	.

.PHONY: format
format: node_modules/prettier
	npm run format

.PHONY: lint-fix
lint-fix: node_modules/eslint
	npm run lint:fix

node_modules/eslint:
	npm ci

node_modules/mocha:
	npm ci

node_modules/prettier:
	npm ci

node_modules/typescript:
	npm ci

run: node_modules/typescript
	npm run start:dev

.PHONY: test
test: node_modules/mocha
	export APP_DISABLE_AUTO_START=true \
	&& export ENV=test \
	&& export NODE_PATH=$(shell pwd)/src \
	&& npm test

.PHONY: test-all
test-all: test-format test-lint test-types test

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-lint
test-types: node_modules/typescript
	npm run test:types