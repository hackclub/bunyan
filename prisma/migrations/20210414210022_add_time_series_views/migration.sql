-- CreateView
CREATE VIEW "FiveMinEmaView" AS
    SELECT
        ROW_NUMBER() OVER(ORDER BY (SELECT 1)) AS "id",
        AVG(average) AS "average",
        slack_id,
        date_trunc('hour', created) + (
            ((date_part('minute', created) :: integer) / 10 :: integer) * 10 :: integer || ' minutes'
        ) :: interval AS ten_min_timestamp
    FROM
        "MovingAverage"
    GROUP BY
        ten_min_timestamp, slack_id;