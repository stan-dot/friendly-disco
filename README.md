# friendly-disco

## prerequisites

MQTT broker running (will work if ran as a containerized service)
https://hub.docker.com/_/eclipse-mosquitto

https://roapi.github.io/docs/quickstart.html
roapi downloaded

we choose to run with pip
https://stackoverflow.com/questions/6587507/how-to-install-pip-with-python-3

arroyo installed
https://doc.arroyo.dev/tutorial/first-pipeline

## steps

on windows:
`run -it --network=host -p 1883:1883 -v /mosquitto/data -v /mosquitto/log docker.io/eclipse-mosquitto`

1. run the script
2. open the browsers


## Debugging

devcontainer - need network setup right

https://community.home-assistant.io/t/developing-in-devcontainer-how-to-access-local-network-of-host/271935/9
    
and missing pip
    apt install python3.11-venv