
CREATE TABLE archived_humidity (

  humidityValue float,

  datetime timestamp

) WITH (

  connector = 'filesystem',

  type = 'sink',

  path = 'file:///tmp/parquet_write',

  format = 'parquet',

  parquet_compression = 'none',

  rollover_seconds = '60',

  time_partition_pattern = '%Y/%m/%d/%H'

--   partition_fields = '"humidityValue"'

);



INSERT INTO archived_humidity

SELECT av as humidityValue, window.end  as datetime

FROM (

  SELECT avg(humidity."humidityValue") as av, hop(interval '2 seconds', interval '10 seconds') as window

  FROM humidity

  WHERE humidity.timestamp IS NOT NULL

  GROUP BY window

) AS subquery;