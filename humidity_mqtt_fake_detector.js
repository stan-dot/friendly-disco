const mqtt = require('mqtt');

// MQTT broker URL
// const brokerUrl = 'mqtt://host.docker.internal:1883'; // Update this with your broker address
const brokerUrl = 'mqtt://localhost:1883'; // Update this with your broker address

// Create an MQTT client
const client = mqtt.connect(brokerUrl);

// Topic for humidity measurements
const humidityTopic = 'sensors/humidity';

// Random walk parameters
let currentHumidity = 50; // Start with 50% humidity
const maxHumidity = 100;
const minHumidity = 0;
const stepSize = 2;

// Publish a humidity value every second
function publishHumidity() {
    // Random walk adjustment
    const step = Math.random() * stepSize * (Math.random() > 0.5 ? 1 : -1);
    currentHumidity = Math.max(minHumidity, Math.min(maxHumidity, currentHumidity + step));
    
    const payload = {
        humidity: currentHumidity.toFixed(2),
        timestamp: new Date().toISOString()
    };

    // Publish the payload to the MQTT broker
    client.publish(humidityTopic, JSON.stringify(payload), () => {
        console.log(`Published to ${humidityTopic}:`, payload);
    });
}

// Handle MQTT events
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    setInterval(publishHumidity, 1000);
});

client.on('error', (err) => {
    console.error('MQTT error:', err);
});
