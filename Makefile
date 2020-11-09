DIALOG_ENDPOINT?="http://localhost/dialog"

PHONY: docker-build
docker-build:
	cd node \
	&& $(MAKE) docker-build

PHONY: format
format:
	cd node \
	&& $(MAKE) format

.PHONY: run
run:
	cd node \
	&& $(MAKE) run

.PHONY: test
test:
	cd node \
	&& $(MAKE) test

.PHONY: test-endpoint
test-endpoint:
	cd node \
	&& MOCKING_DISABLED=1 DIALOG_ENDPOINT=$(DIALOG_ENDPOINT) $(MAKE) test

PHONY: test-all
test-all:
	cd node \
	&& $(MAKE) test-all

PHONY: test-format
test-format:
	cd node \
	&& $(MAKE) test-format

PHONY: test-lint
test-lint:
	cd node \
	&& $(MAKE) test-lint

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1

.PHONY: license
license: LICENSE LICENSE_HEADER
	cd node && npm run license:fix

.PHONY: test-license
test-license: LICENSE LICENSE_HEADER
	cd node && npm run test:license

node_modules/license-check-and-add:
	npm ci