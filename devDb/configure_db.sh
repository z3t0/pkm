#!/bin/bash

echo "Cleanup: Stopping db."
./stop.sh
sleep 5

echo "Cleanup: Delete db files."
./destroy_db.sh

echo "Run db to generate initial files."
./start.sh
sleep 10
./stop.sh

echo "Replace configuration file"
sudo rm -f ./couchdb_etc/docker.ini
sudo cp ./docker.ini  ./couchdb_etc/docker.ini

echo "Starting db"
./start.sh

echo "Wait 5 seconds for db to boot."
sleep 5

echo "Create test user"
USERNAME="test@test.com"
PASSWORD="test123"

python3 ./create_user.py $USERNAME $PASSWORD

echo "Checking the user exists"
curl -X GET "http://$USERNAME:$PASSWORD@127.0.0.1:5984/"

./stop.sh

