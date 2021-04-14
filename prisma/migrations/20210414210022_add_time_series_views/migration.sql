-- CreateView
CREATE VIEW "five_min_ema_view" (
    SELECT
        COUNT(*),
        date_trunc('hour', created) + (
            ((date_part('minute', created) :: integer) / 10 :: integer) * 10 :: integer || ' minutes'
        ) :: interval AS ten_min_timestamp
    FROM
        "MovingAverage"
    GROUP BY
        ten_min_timestamp;

);