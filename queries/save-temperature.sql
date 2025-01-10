
CREATE TABLE archived_temperature(

  temperature_value float,

  datetime timestamp

) WITH (

  connector = 'filesystem',

  type = 'sink',

  path = 'file:///tmp/parquet_write/temperature',
  -- could also be inside an S3 bucket

  format = 'parquet',

  parquet_compression = 'none',

  rollover_seconds = '60',

  time_partition_pattern = '%Y/%m/%d/%H'

);


INSERT INTO archived_temperature

SELECT av as temperature_value, window.end  as datetime

FROM (

  SELECT avg(temperature.temperature_value) as av, hop(interval '2 seconds', interval '10 seconds') as window

  FROM temperature

  WHERE temperature.timestamp IS NOT NULL

  GROUP BY window

) AS subquery;