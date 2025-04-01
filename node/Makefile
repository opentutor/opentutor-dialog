DOCKER_IMAGE?=opentutor-dialog

.PHONY: docker-build
docker-build:
	DOCKER_BUILDKIT=1 \
	docker build \
		-t $(DOCKER_IMAGE) \
	.

.PHONY: format
format:
	cd .. && $(MAKE) format

.PHONY: license
license:
	cd .. && $(MAKE) license

.PHONY: lint-fix
lint-fix: node_modules/eslint
	npm run lint:fix

node_modules/eslint:
	npm ci

node_modules/mocha:
	npm ci

node_modules/typescript:
	npm ci

run: node_modules/typescript
	npm run start:dev

.PHONY: pretty
pretty:
	cd .. && $(MAKE) pretty

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
test-format:
	cd .. && $(MAKE) test-format

.PHONY: test-license
test-license:
	cd .. && $(MAKE) test-license

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-types
test-types: node_modules/typescript
	npm run test:types