CREATE TYPE center_t AS ENUM ('cylinder', 'sphere', 'other');

CREATE TABLE pinata_model
(
    id numeric(10) NOT NULL PRIMARY KEY,
    name varchar(20) UNIQUE NOT NULL,
    model_data jsonb NOT NULL,
    num_points numeric(2) NOT NULL,
    center center_t NOT NULL,
    emblem boolean NOT NULL
);

CREATE INDEX ON pinata_model (center);
CREATE INDEX ON pinata_model (emblem);
CREATE INDEX ON pinata_model (num_points);

CREATE TABLE pinata_interface
(
    id numeric(10) NOT NULL PRIMARY KEY,
    interface_model json NOT NULL,
    model_id numeric(10) NOT NULL,
    FOREIGN KEY (model_id) REFERENCES pinata_model (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);