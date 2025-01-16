# Streaming, Persistence, and Inspection: Building a Data Pipeline for IoT Devices

The ever-growing ecosystem of IoT devices generates vast streams of data that require robust handling for real-time insights and long-term storage. Whether you're monitoring environmental sensors, tracking industrial equipment, or analyzing smart home devices, managing the flow, persistence, and inspection of IoT data is a common challenge. In this post, I’ll walk you through a proof-of-concept system designed to showcase a practical approach to streaming, storing, and visualizing IoT data.

This guide will demonstrate how to set up an MQTT broker for handling data streams from IoT devices, persist that data for later analysis, and inspect it through interactive tools. We'll take a modular approach, ensuring you can follow along and adapt the system to your own needs.
Prerequisites

Before we dive in, ensure you have the following installed on your system:

- Docker / Podman: For containerized services.
- Devcontainer

Optional: 
- MQTT Client: Such as mosquitto_pub or paho-mqtt for testing the broker.
- A JSON Viewer: Optional but helpful for inspecting payloads.

Now, let's start by setting up the backbone of our system: the MQTT broker. This will act as the central hub for collecting and routing messages from IoT devices. Open a terminal and follow the steps below to get it running.

This guide walks you step-by-step through a technical proof of concept. We'll use multiple terminals to manage the workflow. For clarity, each terminal is letter-coded based on its purpose:

- M: MQTT broker
- S: Fake sensors
- A: Arroyo
- I: Parquet file inspection (PQRS)
- R: Roapi
- T: Testing


## Step 1 - Open the Devcontainer

To ensure the best experience, use the provided devcontainer setup. While it's possible to follow these steps on a basic Linux machine, you will need to install certain dependencies manually.

## Step 2: Start the MQTT Broker (Terminal M)

In Terminal M, start the MQTT broker. This can be done using Eclipse Mosquitto.

For Windows/Linux with installed podman:

```podman run -it --network=host -p 1883:1883 -v /mosquitto/data -v /mosquitto/log docker.io/eclipse-mosquitto```

## Step 3: Start Arroyo (Terminal A)

Switch to Terminal A. Verify that Arroyo is installed by running:

```arroyo --help```

You should see output similar to the following:

```
Usage: arroyo [OPTIONS] <COMMAND>

Commands:
  run         Run a query as a local pipeline cluster
  api         Starts an Arroyo API server
  controller  Starts an Arroyo Controller
  cluster     Starts a complete Arroyo cluster
  worker      Starts an Arroyo worker
  compiler    Starts an Arroyo compiler server
  node        Starts an Arroyo node server
  migrate     Runs database migrations on the configured Postgres database
  visualize   Visualizes a query plan
  help        Print this message or the help of the given subcommand(s)

Options:
  -c, --config <CONFIG>          Path to an Arroyo config file, in TOML or YAML format
      --config-dir <CONFIG_DIR>  Directory in which to look for configuration files
  -h, --help                     Print help
  -V, --version                  Print version
```

Next, start the Arroyo cluster by running:

```npm run arroyo```

    Note: If Arroyo reports a port conflict, update the config/arroyo.toml file to set a new port, such as 5114.

Once Arroyo is running successfully, proceed to the next step.

## Step 4: Access the Arroyo Admin Panel

Open a browser and navigate to the Arroyo admin panel. By default, the URL is:
http://localhost:5112/


If this is your first time using Arroyo, consult the [First Pipeline documentation](https://doc.arroyo.dev/tutorial/first-pipeline) for guidance.


## Step 5: Connect Arroyo to Mosquitto

In the Arroyo admin UI, create a new connection of type mqtt. Use the following details:

- Name: broker
- URL: mqtt://127.0.0.1:1883

Click Validate to confirm the connection, and then click Create.

In the next screen, configure a specific MQTT topic as a table source. For this, continue with the following steps.


## Step 6: Run the Fake Sensor (Terminal S)

Switch to Terminal S and run the humidity simulation:
`npm run humidity`

You should see output similar to:

```
Connected to MQTT broker
Published to sensors/humidity: {
  humidity_value: 51.519280749999005,
  timestamp: '2025-01-15T17:05:18.324Z'
}
Published to sensors/humidity: {
  humidity_value: 52.97255972800715,
  timestamp: '2025-01-15T17:05:19.325Z'
}
```

If the MQTT broker connection fails, double-check that the broker is running and accessible at the correct port.

Back in the Arroyo UI, configure the topic as a table:

1. Use the topic sensors/humidity from the sensors/humidity_mqtt_fake_detector.js file.
2. Set the data format to JSON and the schema type to JSON schema.
3. Use the schema located in schemas/humidity-schema.json.

Click Validate, and then name the table humidity to match the subsequent SQL queries.


## Step 7: Run the Average Humidity Query

Open queries/average-humidity.sql and paste its contents into a new pipeline in the Arroyo UI. Preview the results to verify that a table of averages is being generated.

When ready, launch the pipeline locally. Name the pipeline something like "average humidity test." Congratulations! Data is now being processed from the Node.js sensors to MQTT, through Arroyo, and into the UI.

## Step 8: Save Humidity Data to Parquet Files

To save the data to Parquet format:

1. Open queries/save-humidity.sql.
2. In the Arroyo UI, preview the query and enable the Sinks checkbox.
3. Deploy the query to save the processed data to your filesystem.

Files will be written to the path defined in the SQL file and depends on date and time. For example:
file:///tmp/parquet_write/humidity/%Y/%m/%d/%H

Note: Files may temporarily appear in an __in_progress folder while data accumulates.

## Step 9: Inspect the Parquet Files (Terminal I)

Switch to Terminal I and use [pqrs](https://github.com/manojkarthick/pqrs) to inspect the Parquet files. If pqrs is not installed, install it using Cargo:

```cargo install pqrs```

To preview the data:

```pqrs cat <filename>```

Confirm that the averages in the Parquet files match the Arroyo UI output.

## Step 10: Serve Parquet Files via Roapi (Terminal R)

Install [Roapi](https://roapi.github.io/docs/quickstart.html) with pip:

```pip install roapi```

Then configure Roapi to serve the Parquet files. Run:

```npm run roapi:humidity```

Visit the API endpoint to confirm that the data is being served.

Note:
For this devcontainer you might need to adjust your python installation and CLI to include pip correctly.

we choose to run with pip
https://stackoverflow.com/questions/6587507/how-to-install-pip-with-python-3

You might need to run those steps with a Python3.11 installation:

```
apt-get update -y
apt install python3.11-venv
python -m venv .venv
source .venv/bin/activate
which pip
```
In order for the install command to succeed:
```
pip install roapi
```

Your mileage may vary depending on your Python version.


## Step 11: Optional - Process Temperature Data

Repeat steps 6–10 for temperature data to create a more complex dataset. Use the configuration file config/roapi-joint-config.yaml to serve both datasets simultaneously.

## Step 12: Validate with Tests (Terminal T)

In Terminal T, run the test suite:

```npm run test```

If all steps were followed correctly, all tests should pass. You can also use tools like Postman or Curl to manually test the Roapi API.

Run `npm run test` to run the nodejs test suite.
Note: if you skipped step 10 expect only 2 out of three tests to work.
Note: You may need to adjust the endpoint URL depending on your roapi config

You may also verify that the API works manually and test your own queries with a tool like postman or curl.
See the roapi instructions on the topic. 
https://roapi.github.io/docs/api/schema.html

## Step 13: Take It Beyond

Consider extending this tutorial by creating a frontend that visualizes historical and real-time data. For example, you could create a graph showing temperature or humidity trends using a library like Recharts.

 