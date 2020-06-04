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
