import { expect } from 'chai';
import axios from 'axios';

describe('GraphQL Queries Against RoAPI', () => {
    const apiUrl = 'http://localhost:8084/api/graphql';

    it('should return the correct humidity', async () => {
        const query = `humidity_0(
                filter: {
                    humidityValue: { gteq: 4, lt: 1000 }
                }
                sort: [
                    { field: "timestamp" }
                ]
                limit: 100
            ) {
                humidityValue
                timestamp
            }
        `;

        // Expected result (update these values based on your dataset)
        const expectedResponse = [
            { temperature: 22.5, humidity: 55 },
            { temperature: 23.1, humidity: 58 },
        ];

        try {
            // Make the POST request to the GraphQL endpoint
            const response = await axios.post(apiUrl, { query });

            console.log(response);
            // Validate the response structure and data
            expect(response.status).to.equal(200);
            expect(response.data).to.have.property('data');
            expect(response.data.data).to.have.property('weather_data');
            expect(response.data.data.weather_data).to.deep.equal(expectedResponse);
        } catch (error) {
            // Handle errors in the request or assertion
            console.error('Error in GraphQL test:', error.response?.data || error.message);
        }
    });
});

describe('REST Queries Against humidity API', () => {
    const apiUrl = 'http://localhost:8084/api/tables';

    it('should return the correct humidity', async () => {
        const tableName = `humidity-0`;
        try {
            // Make the POST request to the GraphQL endpoint
            const response = await axios.get(`${apiUrl}/${tableName}`);

            // console.log(response);
            // Validate the response structure and data
            //           data: [
            // { humidityValue: 3.0968509, datetime: '2025-01-09T15:55:54' },
            // { humidityValue: 2.1690137, datetime: '2025-01-09T15:55:56' },
            // { humidityValue: 1.4636809, datetime: '2025-01-09T15:55:58' },
            // { humidityValue: 0.95442414, datetime: '2025-01-09T15:56:00' },
            // { humidityValue: 0.8919254, datetime: '2025-01-09T15:56:02' },
            // { humidityValue: 0.65495217, datetime: '2025-01-09T15:56:04' },
            // { humidityValue: 0.7619563, datetime: '2025-01-09T15:56:06' },
            //           ]
            expect(response.status).to.equal(200);
            // expect length to be greater than zero
            expect(response.data.length).to.be.greaterThan(0);
            expect(response.data[0]).to.have.property('humidity_value');
            // expect humidity for all array members to be between 0 and 100
        } catch (error) {
            // Handle errors in the request or assertion
            console.error('Error in GraphQL test:', error.response?.data || error.message);
        }

    });
});


describe('REST Queries Against temperature ROAPI', () => {
    const apiUrl = 'http://localhost:8085/api/tables';

    it('should return the correct temperature', async () => {
        const tableName = `temperature-0`;
        try {
            // Make the POST request to the GraphQL endpoint
            const response = await axios.get(`${apiUrl}/${tableName}`);

            console.log(response);
            // Validate the response structure and data
            //           data: [
            // { temperatureValue: 30.2, datetime: '2025-01-09T15:55:54' },
            // { temperatureValue: 30.3, datetime: '2025-01-09T15:55:56' },
            // { temperatureValue: 30.4, datetime: '2025-01-09T15:55:58' },
            // { temperatureValue: 30.0, datetime: '2025-01-09T15:56:00' },
            // { temperatureValue: 30.7, datetime: '2025-01-09T15:56:02' },
            // { temperatureValue: 30.0, datetime: '2025-01-09T15:56:04' },
            // { temperatureValue: 30.9, datetime: '2025-01-09T15:56:06' },
            //           ]
            expect(response.status).to.equal(200);
            // expect length to be greater than zero
            expect(response.data.length).to.be.greaterThan(0);
            expect(response.data[0]).to.have.property('temperature_value');
            // expect humidity for all array members to be between 0 and 100
        } catch (error) {
            // Handle errors in the request or assertion
            console.error('Error in GraphQL test:', error.response?.data || error.message);
            throw error;
        }

    });
});
