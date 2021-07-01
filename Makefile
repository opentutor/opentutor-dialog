DIALOG_ENDPOINT?="http://localhost/dialog"

.PHONY: docker-build
docker-build:
	cd node \
	&& $(MAKE) docker-build

.PHONY: format
format:
	$(MAKE) pretty
	$(MAKE) license

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1

.PHONY: license
license: node_modules/license-check-and-add LICENSE LICENSE_HEADER
	npm run license:fix

node_modules/license-check-and-add:
	npm ci

node_modules/prettier:
	npm ci

.PHONY: pretty
pretty: node_modules/prettier
	npm run pretty

.PHONY: run
run:
	cd node \
	&& $(MAKE) run

.PHONY: test
test:
	cd node \
	&& $(MAKE) test

.PHONY: test-all
test-all:
	cd node \
	&& $(MAKE) test-all

.PHONY: test-audit
test-audit:
	cd node \
	&& $(MAKE) test-audit

.PHONY: test-format
test-format:
	$(MAKE) test-pretty
	$(MAKE) test-license

.PHONY: test-license
test-license: node_modules/license-check-and-add LICENSE LICENSE_HEADER
	npm run test:license

.PHONY: test-lint
test-lint:
	cd node \
	&& $(MAKE) test-lint

.PHONY: test-pretty
test-pretty: node_modules/prettier
	npm run test:pretty
	
.PHONY: test-types
test-types:
	cd node \
	&& $(MAKE) test-types
