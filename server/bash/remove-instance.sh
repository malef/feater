#!/bin/bash

id=$1

if [ -z $id ]; then
    echo "Provide build instance ID"
    exit 1
fi

echo "Removing build instance $1 from MongoDB..."
docker exec mongo-db mongo feat --eval "db.getCollection('buildInstance').remove(ObjectId('$id'))"
echo

echo "Removing Docker containers..."
docker rm -f `docker ps -a --filter=name=feat$1 --format="{{.Names}}"`
echo

echo "Removing Docker volumes..."
docker volume rm $(docker volume ls -qf dangling=true)
echo

echo "Removing Docker networks..."
docker network prune -f
echo

echo "Removing instance directory..."
sudo rm -fr /home/ubuntu/xsolve-feat/buildInstances/$1
echo

echo "Disabling Apache2 site..."
find /etc/apache2/sites-enabled/ -name $1*.conf -printf "%f\n" | sudo xargs -0 -r a2dissite -q
echo

echo "Removing Apache2 configuration file..."
find /etc/apache2/sites-available/ -name $1*.conf -print0 | sudo xargs -0 -r rm
echo

echo "Reloading Apache2..."
sudo service apache2 reload
echo

echo "Done"
