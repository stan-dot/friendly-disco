import { connect } from 'mqtt';

// MQTT broker URL
const brokerUrl = 'mqtt://localhost'; // Change to your broker's URL if needed

// MQTT topic for temperature measurements
const topic = 'sensors/temperature';

// Connect to the MQTT broker
const client = connect(brokerUrl);

// Initial temperature
let temperature = 20 + Math.random() * 5; // Starting temperature between 20 and 25

// Function to simulate random walk
function randomWalk(value, step = 0.5) {
    const change = (Math.random() - 0.5) * step * 2; // Random change within ±step
    return value + change;
}

// Publish temperature updates periodically
const interval = 2000; // Interval in milliseconds (2 seconds)

client.on('connect', () => {
    console.log('Connected to MQTT broker');

    setInterval(() => {
        temperature = randomWalk(temperature);
        const payload = JSON.stringify({ temperature_value: temperature, timestamp: Date.now() });
        client.publish(topic, payload, { qos: 0 }, (err) => {
            if (err) {
                console.error('Failed to publish temperature:', err);
            } else {
                console.log(`Published: ${payload}`);
            }
        });
    }, interval);
});

client.on('error', (err) => {
    console.error('MQTT connection error:', err);
    client.end();
});
