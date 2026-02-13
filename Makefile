.PHONY: up down build logs

up:
	./start.sh

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f
