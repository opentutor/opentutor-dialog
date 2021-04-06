DOCKER_IMAGE?=opentutor-dialog

.PHONY: docker-build
docker-build:
	DOCKER_BUILDKIT=1 \
	docker build \
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

node_modules/license-check-and-add:
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
test-all: test-audit test-format test-lint test-license test-types test

.PHONY: test-audit
test-audit:
	npm run test:audit

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-license
test-license: node_modules/license-check-and-add
	npm run test:license

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-types
test-types: node_modules/typescript
	npm run test:types