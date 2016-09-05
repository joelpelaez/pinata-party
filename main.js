/**
 * main.js - Pinata database REST API
 * licencing pending
 */

var express = require('express'),
    path    = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    pg = require('pg');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var connectionString = (process.env.DATABASE_URL || 'postgres://localhost:5432/pinata');

var router = express.Router();

/*
 * get all modules by HTTP request http://[server]/api/models{?query=value}
 * the models can be filter by name, number of points, center design and
 * it has emblem ot not.
 *
 * This only return metadata from the table, the JSON model must be received by 
 * request http://[server]/api/models/[id].  This isn't overload the search request.
 */
router.get('/models', function(req, res) {
    var results = [];
    var queryString = 'SELECT id, name, num_points, center, emblem FROM pinata_model WHERE 1 = 1 ';
    var args = [];
    var count = 1;
    if (req.query.name) {
        queryString += "AND name LIKE $" + count + " ";
        args.push(req.query.name);
        count++;
    }
    if (req.query.num_points) {
        queryString += "AND num_points = $" + count + " ";
        args.push(req.query.num_points);
        count++;
    }
    if (req.query.center) {
        queryString += "AND center = $" + count + " ";
        args.push(req.query.center);
        count++;
    }
    if (req.query.emblem) {
        queryString += "AND emblem = $" + count + " ";
        args.push(req.query.emblem);
        count++;
    }
    
    pg.connect(connectionString, function(err, client, done) {
        
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ sucess: false, data: err});
        }

        var query = client.query(queryString, args);

        query.on('row', function(row) {
            results.push(row);
        });

        query.on('end', function() {
            done();
            return res.json(results);
        });

        query.on('error', function(error) {
            done();
            console.log(error);
            return res.status(500).json({ sucess: false, data: error });
        });
    });

});

/*
 * Get model by id, this only return model JSON (only one field of one row)
 */
router.get('/models/:id', function(req, res) {
    var result;

    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ sucess: false, data: err});
        }

        var query = client.query('SELECT model_data FROM pinata_model WHERE id = $1 LIMIT 1', [req.params.id]);

        query.on('row', function(row) {
            result = row['model_data'];
        });

        query.on('end', function() {
            done();
            return res.json(result);
        });

        query.on('error', function(error) {
            done();
            console.log(error);
            return res.status(500).json({ sucess: false, data: error });
        });
    });
});
router.get('/models/:id/interface', function(req, res) {
    var result;

    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ sucess: false, data: err});
        }

        var query = client.query('SELECT interface_model FROM pinata_interface WHERE model_id = $1 LIMIT 1', [req.params.id]);

        query.on('row', function(row) {
            result = row['interface_model'];
        });

        query.on('end', function() {
            done();
            return res.json(result);
        });

        query.on('error', function(error) {
            done();
            console.log(error);
            return res.status(500).json({ sucess: false, data: error });
        });
    });
});

router.get('/emblems', function(req, res) {
    var results = [];

    pg.connect(connectionString, function(err, client, done) {
        var query;
        if (err) res.status(500).json({ sucess: false, data: error });

        if (req.query.search) {
            query = client.query('SELECT * FROM pinata_emblem WHERE name LIKE $1', [req.query.search]);
        } else {
            query = client.query('SELECT * FROM pinata_emblem');
        }

        query.on('row', function(row) {
            results.push(row);
        });

        query.on('end', function() {
            done();
            return res.json(results);
        });

        query.on('error', function(error) {
            done();
            console.log(error);
            return res.status(500).json({ sucess: false, data: error });
        });
    });
})

app.use('/api', router);

var server = app.listen(app.get('port'), function() {
    console.log("Listening to port %s", server.address().port);
});
