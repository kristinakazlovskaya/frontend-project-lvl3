install:
	npm ci

lint:
	npx eslint .

test:
	npm test

build:
	rm -rf dist
	NODE_ENV=production npx webpack