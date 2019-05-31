specs := $(shell find ./test -name '*.test.js' ! -path "*node_modules/*")
reporter = spec
opts =
test:
	@node_modules/.bin/mocha --reporter ${reporter} ${opts} ${specs}


lint:
	@node_modules/.bin/jshint lib/client.js lib/scp.js index.js bin/scp2

out_dir = _site
out_file = ${out_dir}/coverage.html

coverage:
	@mkdir -p ${out_dir}
	@rm -fr lib-cov
	@node_modules/.bin/jscoverage lib lib-cov
	@SCP2_COVERAGE=1 $(MAKE) test opts=lib-cov reporter=html-cov --no-print-directory > ${out_file}
	@echo
	@rm -fr lib-cov
	@echo "Built Report to ${out_file}"
	@echo

clean:
	@rm -fr _site

.PHONY: build test lint coverage
