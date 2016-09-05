CREATE TYPE center_t AS ENUM ('cylinder', 'sphere', 'other');

CREATE TABLE pinata_model
(
    id serial NOT NULL PRIMARY KEY,
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
    id serial NOT NULL PRIMARY KEY,
    interface_model json NOT NULL,
    model_id serial NOT NULL,
    FOREIGN KEY (model_id) REFERENCES pinata_model (id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE pinata_emblem
(
    id serial NOT NULL PRIMARY KEY,
    name varchar(20) NOT NULL,
    filename varchar(128) NOT NULL,
    sample varchar(128) NOT NULL
);

CREATE TABLE pinata_category
(
    id serial NOT NULL PRIMARY KEY,
    name varchar(20) NOT NULL
);

CREATE TABLE pinata_emblem_with_category
(
    emblem_id integer NOT NULL,
    category_id integer NOT NULL,
    PRIMARY KEY (emblem_id, category_id),
    FOREIGN KEY (emblem_id) REFERENCES pinata_emblem (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES pinata_category (id) ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX ON pinata_emblem_with_category (emblem_id);
CREATE INDEX ON pinata_emblem_with_category (category_id);