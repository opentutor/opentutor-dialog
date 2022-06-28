DOCKER_IMAGE?=react

.PHONY: docker-build
docker-build:
	DOCKER_BUILDKIT=1 \
	docker build \
		-t $(DOCKER_IMAGE) \
	.

.PHONY: format
format:
	cd .. && $(MAKE) format

.PHONY: pretty
pretty:
	cd .. && $(MAKE) pretty

.PHONY: license
license:
	cd .. && $(MAKE) license

.PHONY: lint-fix
lint-fix: node_modules
	npm run lint:fix

node_modules:
	npm ci

.PHONY: test-all
test-all: test-audit test-format test-lint test-license test-types test

.PHONY: test
test: node_modules
	npm test

.PHONY: test-audit
test-audit:
	npm run test:audit

.PHONY: test-format
test-format:
	cd .. && $(MAKE) test-format

.PHONY: test-lint
test-lint: node_modules
	npm run test:lint

.PHONY: test-license
test-license:
	cd .. && $(MAKE) test-license

.PHONY: test-types
test-types: node_modules
	npm run test:types