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


## Step 4 - Connect arroyo to mosquitto

Follow the instructions in the arroyo UI to add a new connection of the 'mqtt' type. 
You won't be asked to provide a specific topic for the connection yet. 

There we add the details of the local mosquitto container, most likely with port 1883. 

Give it a name like `broker`, and you can skip all the fields but the url (which has a star). Put there `mqtt://127.0.0.1:1883` 

Press validate, get a green notification and go on to 'create' the connection.

The next screen will be configuring a specific topic as a table. For that we need the next step.


## Step 5 - Average Humidity query - terminal S (for sensors)

In a new terminal, run 
`npm run humidity`
You should see output similar to this:

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

If you see 'mqtt broker connection failed` then check if the mosquitto broker is running and at the correct port.

In the arroyo UI let's add a new source for MQTT messages.
First we need to define the stream of messages for `humidity` and save it as a table.
Let's go back to Arroyo UI, where we left at 'create mqtt connection'.
Our `topic` can be gleaned from the `sensors/humidity_mqtt_fake_detector.js`
which is 'sensors/humidity'. We keep the table type source.
The next screen, step 3 in my interface (your may wary), will have the 'data format' field.
Choose the options JSON and a field for `schema type` will appear.
There choose `JSON schema`. Then a text input field will appear. There add json schema from `schemas/humidity-schema.json`.
Press `validate` to proceed.

Give the connection the table name `humidity` to match our later SQL.


Next, open `queries/average-humidity.sql`.

In the arroyo UI, open `pipelines` and press `add new pipeline` to add a new query.
There paste the contents of the sql file.

Press preview to see a growing table of averages.
Then press launch to deploy it locally, give it a simple name like 'average humidity test'.
Well done processing from nodejs to mqtt broker to arroyo to the web interface! Let's go further.

## Step 6 - Saving humidity data to filesystem

Let's save this data to the filesystem in parquet format.
The query in `queries/save-humidity.sql` defines a new sink - without needing any action in arroyo UI and writes averages to it.

This time when you press 'preview' make sure to tick the box for 'enable sinks' to actually get your files into the filesystem.

## Step 7 - (optional) Inspecting the parquet file - terminal I (for inspect)

We can now go into the location that we write the data - you can find it in the `queries/save-humidity.sql` file, line 14, but inside we'll see a nested folder structure and binary files. 
`path = 'file:///tmp/parquet_write/humidity'` 
Your file will be somewhere inside that folder, as we used 
`time_partition_pattern = '%Y/%m/%d/%H'` folder path will depend on the time you run the system.
As they have a binary format, to preview parquet files we'll need something more powerful than 'cat' and 'ls'.
NOTE: files will be in the temporary `__in_progress` folder until one file worth of data fills up. this can take a minute or two.

We'll use `pqrs` a tool made in Rust 🦀 for inspecting parquet files.
If the devcontainer setup went smoothly you should have it in your path.
https://github.com/manojkarthick/pqrs
You can download it as a ready binary.

To install it we'll use `cargo`, the rust package manager. It's quite easy to set up.
Devcontainer should have it already - 
https://doc.rust-lang.org/cargo/getting-started/installation.html

To install pqrs just run `cargo install pqrs`.

Regardless of your method of installation.
Run `pqrs` to see if anything comes up, and then run `pqrs cat filename`.

Inspect one of the parquet files with pqrs to see if the averages inside look similar to the ones you saw as output in the arroyo UI.

If yes, this means that the sink works! Well done :\)

The files are safely recorded and won't change - their writing was time-specific - this means they are static.
Let's see how easily we can serve static files as an API with roapi.

## Step 8 - roapi installation  - terminal R (for roapi)

Roapi recommended installation is with pip.
For this devcontainer you might need to adjust your python installation and CLI to include pip correctly.
https://roapi.github.io/docs/quickstart.html
we choose to run with pip
https://stackoverflow.com/questions/6587507/how-to-install-pip-with-python-3

I had to run those steps with a Python3.11 installation:

```
apt-get update -y
apt install python3.11-venv
python -m venv .venv
source .venv/bin/activate
which pip
```
In order for this command to succeed:
```
pip install roapi
```

Your mileage may vary depending on your Python version.


## Step 9 - serve the static parquet files - still in terminal R

Set the path in the correct roapi config yaml to be your data path with the right date and time.
After that `npm run roapi:humidity` should succeed in starting the server.

## Step 10 - (optional) Follow the steps 5, 6, 7, 9 but for `temperature` to get a more complex and realistic dataset

This optional step is left as an exercise to the reader.

Note: for step 9 you'd want to use `config/roapi-joint-config.yaml` to serve both tables at the same time.

## Step 11 - Validate with the test - terminal T (for testing)

Run `npm run test` to run the nodejs test suite.
Note: if you skipped step 10 expect only 2 out of three tests to work.
Note: You may need to adjust the endpoint URL depending on your roapi config

You may also verify that the API works manually and test your own queries with a tool like postman or curl.
See the roapi instructions on the topic. 
https://roapi.github.io/docs/api/schema.html

## Step 12 - Close the terminals

Use `Ctrl+C` to close all the running processes in each terminal.

## Step 13 - taking it beyond the tutorial

You may want to make a front end showing both the historical data and ongoing processes. For instance mapping the graph of temperature against hour of day for two days: today and a month ago.
Maybe later a react page too quickly with vite https://recharts.org/en-US/examples
Let me know if you make it!

