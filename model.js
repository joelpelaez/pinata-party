var express = require('express');
var router = express.Router();

var connectionString = app.get('dburl');

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
    var queryString = 'SELECT id, name, num_points, kind FROM pinata_control.model WHERE 1 = 1 ';
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
        queryString += "AND kind = $" + count + " ";
        args.push(req.query.center);
        count++;
    }
    
    pg.connect(connectionString, function(err, client, done) {
        
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
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
            return res.status(500).json({ success: false, data: error });
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
            return res.status(500).json({ success: false, data: err});
        }

        var query = client.query('SELECT data FROM pinata_control.model WHERE id = $1 LIMIT 1', [req.params.id]);

        query.on('row', function(row) {
            result = row['data'];
        });

        query.on('end', function() {
            done();
            return res.json(result);
        });

        query.on('error', function(error) {
            done();
            console.log(error);
            return res.status(500).json({ success: false, data: error });
        });
    });
});
router.get('/models/:id/interface', function(req, res) {
    var result;

    pg.connect(connectionString, function(err, client, done) {
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err});
        }

        var query = client.query('SELECT interface_model FROM pinata_control.interface WHERE model_id = $1 LIMIT 1', [req.params.id]);

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
            return res.status(500).json({ success: false, data: error });
        });
    });
});

router.get('/emblems', function(req, res) {
    var results = [];

    pg.connect(connectionString, function(err, client, done) {
        var query;
        if (err) {
            done();
            console.log(err);
            res.status(500).json({ success: false, data: err });
        }

        if (req.query.search) {
            query = client.query('SELECT * FROM pinata_control.emblem WHERE name LIKE $1', [req.query.search]);
        } else {
            query = client.query('SELECT * FROM pinata_control.emblem');
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
            return res.status(500).json({ success: false, data: error });
        });
    });
});

module.exports = router;