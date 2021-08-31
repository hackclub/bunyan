-- CreateIndex
CREATE INDEX "Message.created_index" ON "Message"("created");


-- CreateIndex
CREATE INDEX "MovingAverage.created_index" ON "MovingAverage"("created");
CREATE INDEX "MovingAverage.id_index"      ON "MovingAverage"("id");


-- CreateIndex
CREATE INDEX "Reaction.created_index" ON "Reaction"("created");


-- CreateTrigger
CREATE OR REPLACE FUNCTION trf_keep_row_number_steady()
RETURNS TRIGGER AS
$body$
DECLARE
  cur_rows := (
    SELECT reltuples::bigint FROM pg_catalog.pg_class
    WHERE relname = 'MovingAverage'
  ).reltuples%type;
BEGIN
  -- delete only where are too many rows
  IF (SELECT count(id) FROM "MovingAverage") > 10000000 -- ten million
  THEN
    -- I assume here that id is an auto-incremented value in log_table
    DELETE FROM "MovingAverage"
    WHERE id = (SELECT min(id) FROM "MovingAverage");
  END IF;
END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER tr_keep_row_number_steady
  AFTER INSERT ON log_table
  FOR EACH ROW
    EXECUTE PROCEDURE trf_keep_row_number_steady();
