
# define the two topics
# start mqtt broker with the two topics
# start arroyo sink and source
# write from mqtt into parquet
# start the node services, run for a minute or two
node humidity_mqtt_fake_detector.js
node temperature_mqtt_fake_detector.js
# stop the services
# serve parquet result over roapi

# verify with curl that the api works

# stop the services: broker, arroyo

