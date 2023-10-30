PORT=6500
IP=0.0.0.0
FILE=.\transferFiles\textFile_ml.txt

install:
	npm install -i

client:
	npm run client -- --ip $(IP) --port $(PORT) --file $(FILE)

server:
	npm run server

help:
	npm run client -- --help

.PHONY: install client server help