CREATE SCHEMA pinata_control;

SET search_path = pinata_control, "$user", public;

CREATE TABLE bitacora
(
	username name NOT NULL,
	tablename name NOT NULL,
	schemaname name NOT NULL,
	action char(6) NOT NULL,
	id_row numeric(10) NULL,
	date timestamp NOT NULL
);

CREATE FUNCTION log_actions() RETURNS TRIGGER AS $$
	BEGIN
		INSERT INTO bitacora (username, tablename, schemaname, action, id_row, date) VALUES (current_user, TG_TABLE_NAME, TG_TABLE_SCHEMA, TG_OP, NEW.id, NOW());
		RETURN NULL;
	END;
$$ LANGUAGE plpgsql;

CREATE TABLE model
(
	id serial NOT NULL PRIMARY KEY,
	name varchar(40) NOT NULL,
	data jsonb NOT NULL,
	kind varchar(40) NOT NULL,
	num_points numeric(2) NOT NULL,
	provider_id integer NULL
);

CREATE INDEX ON model (provider_id);

CREATE TABLE interface
(
    id serial NOT NULL PRIMARY KEY,
    interface_model json NOT NULL,
    model_id serial NOT NULL
);

CREATE INDEX ON interface (model_id);

CREATE TABLE emblem
(
    id serial NOT NULL PRIMARY KEY,
    name varchar(20) NOT NULL,
    filename varchar(128) NOT NULL,
    sample varchar(128) NOT NULL
);

CREATE TABLE category
(
    id serial NOT NULL PRIMARY KEY,
    name varchar(20) NOT NULL
);

CREATE TABLE emblem_with_category
(
    emblem_id integer NOT NULL,
    category_id integer NOT NULL,
    PRIMARY KEY (emblem_id, category_id)
);

CREATE INDEX ON emblem_with_category (emblem_id);
CREATE INDEX ON emblem_with_category (category_id);

CREATE TRIGGER model_audit
AFTER INSERT OR UPDATE OR DELETE ON model
FOR EACH ROW EXECUTE PROCEDURE log_actions();

CREATE TABLE provider
(
	id serial NOT NULL PRIMARY KEY,
	firstname varchar(40) NOT NULL,
	lastname varchar(40) NULL,
	maidenname varchar(40) NULL,
	rfc varchar(40) NULL,
	address varchar(60) NOT NULL
);

CREATE TRIGGER provider_audit
AFTER INSERT OR UPDATE OR DELETE ON provider
FOR EACH ROW EXECUTE PROCEDURE log_actions();

CREATE TABLE provider_telephone
(
	id integer NOT NULL,
	telephone varchar(20) NOT NULL,
	PRIMARY KEY (id, telephone)	
);

CREATE TRIGGER provider_telephone_audit
AFTER INSERT OR UPDATE OR DELETE ON provider_telephone
FOR EACH ROW EXECUTE PROCEDURE log_actions();

CREATE TABLE client
(
	id serial NOT NULL PRIMARY KEY,
	name varchar(40) NOT NULL,
	lastname varchar(40) NULL,
	maidenname varchar(40) NULL,
	rfc varchar(10) NULL
);

CREATE TRIGGER client_audit
AFTER INSERT OR UPDATE OR DELETE ON client
FOR EACH ROW EXECUTE PROCEDURE log_actions();

CREATE TABLE saleman
(
	id serial NOT NULL PRIMARY KEY,
	username varchar(40) NOT NULL,
	firstname varchar(40) NOT NULL,
	lastname varchar(40) NOT NULL,
	maidenname varchar(40) NULL,
	password varchar(64) NOT NULL
);

CREATE TRIGGER saleman_audit
AFTER INSERT OR UPDATE OR DELETE ON saleman
FOR EACH ROW EXECUTE PROCEDURE log_actions();

CREATE TABLE sale
(
	id serial NOT NULL PRIMARY KEY,
	date timestamp NOT NULL,
	client_id integer NOT NULL,
	saleman_id integer NOT NULL,
	model_id integer NOT NULL,
	description text NOT NULL
);

CREATE INDEX ON sale (client_id);
CREATE INDEX ON sale (saleman_id);
CREATE INDEX ON sale (model_id);

CREATE TRIGGER sale_audit
AFTER INSERT OR UPDATE OR DELETE ON sale
FOR EACH ROW EXECUTE PROCEDURE log_actions();

ALTER TABLE model ADD FOREIGN KEY (provider_id) REFERENCES provider (id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE interface ADD FOREIGN KEY (model_id) REFERENCES model (id) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE emblem_with_category ADD FOREIGN KEY (emblem_id) REFERENCES emblem (id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE emblem_with_category ADD FOREIGN KEY (category_id) REFERENCES category (id) ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE provider_telephone ADD FOREIGN KEY (id) REFERENCES provider (id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE sale ADD FOREIGN KEY (client_id) REFERENCES client (id) ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE sale ADD FOREIGN KEY (saleman_id) REFERENCES saleman (id) ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE sale ADD FOREIGN KEY (model_id) REFERENCES model (id) ON UPDATE NO ACTION ON DELETE NO ACTION;
