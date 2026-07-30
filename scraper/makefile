run-dev:
	docker build -t scraper .
	docker run --env-file .env.dev -e INSTANCE_ID=scraper-1 --network backend_default scraper

run-dev-local:
	docker build -t scraper .
	docker run --env-file .env.local -e INSTANCE_ID=scraper-1 --network backend_default scraper