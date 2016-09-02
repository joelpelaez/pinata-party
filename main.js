var express = require('express'),
    path    = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    pg = require('pg');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var connectionString = 'postgres://localhost:5432/pinata';

var router = express.Router();

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
    });

});
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
    });
});

app.use('/api', router);
//app.get('*', function(req, res) {
//    console.log(req);
//});
var server = app.listen(3000, function() {
    console.log("Listening to port %s", server.address().port);
});
