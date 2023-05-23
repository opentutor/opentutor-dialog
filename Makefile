LICENSE_CONFIG?="license-config.json"

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

.PHONY: license-deploy
license-deploy: node_modules LICENSE LICENSE_HEADER
	LICENSE_CONFIG=${LICENSE_CONFIG} npm run license:deploy

.PHONY: license
license: node_modules LICENSE LICENSE_HEADER
	npm run license:fix

node_modules:
	npm ci

.PHONY: pretty
pretty: node_modules
	npm run pretty

.PHONY: test-format
test-format:
	$(MAKE) test-pretty
	$(MAKE) test-license

.PHONY: test-pretty
test-pretty: node_modules
	npm run test:pretty

.PHONY: test-license
test-license: node_modules LICENSE LICENSE_HEADER
	npm run test:license

.PHONY: test-audit
test-audit:
	cd node && $(MAKE) test-audit

.PHONY: test-lint
test-lint:
	cd node && $(MAKE) test-lint

.PHONY: test-types
test-types:
	cd node && $(MAKE) test-types

.PHONY: test-all
test-all:
	cd node && $(MAKE) test-all