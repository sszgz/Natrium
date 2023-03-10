# Natrium

## Pre-install
### Redis

- install redis:
apt-get install redis

- install redisjson:
build from github.com/RedisJSON/RedisJSON/

mkdir /etc/redis/modules/
mv rejson.so /etc/redis/modules/

/etc/redis/redis.conf
loadmodule /etc/redis/modules/rejson.so

