IMAGE=vivekbhandari/nodemongo

image-dev:
	docker build -f ./Dockerfile_dev -t ${IMAGE} .

image:
	docker build -t ${IMAGE} .

start-dev:
	docker run -dt --name nodemongo --hostname nodemongo -p 3000:3000 ${IMAGE}

start:
	docker-compose -f docker-compose.yml up -d

mongo:
	docker exec -ti nodemongo_mongo_1 mongo -u root -p root

cleandb:
	docker volume remove nodemongo_mongodata

logs:
	docker ps -a
	docker logs -f nodemongo_nodemongo_1

removeDanglingImages:
	docker rmi -f $(docker images -f "dangling=true" -q)

stop:
	docker stop `docker ps --no-trunc -aq`
	docker rm `docker ps --no-trunc -aq`

