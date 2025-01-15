SELECT avg(humidity.humidity_value) as avg_humidity

FROM humidity

WHERE humidity.timestamp IS NOT NULL

GROUP BY hop(interval '2 seconds', interval '10 seconds');
