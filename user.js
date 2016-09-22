var express = require('express');
var router = express.Router();

var connectionString = app.get('dburl');

router.post('/login', function(req, res) {
    pg.connect(connectionString, function(err, client, done) {
        var result = false;
        var token;
        var query;
        if (err)  {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        query = client.query('SELECT * FROM pinata_user WHERE username LIKE $1 AND password LIKE $2 LIMIT 1', [req.body.username, req.body.password]);

        query.on('row', function(row) {
            token = jwt.sign(row, app.get('secret'), {
                expiresIn: 24 * 60 * 60
            });
            result = true;
        });

        query.on('end', function() {
            done();
            if (result)
                return res.json({ success: true, message: 'OK', token: token });
            else
                return res.json({ success: false, message: 'Username or password invalid' });
        });

        query.on('error', function(error) {
            done();
            console.log(error);
            return res.status(500).json({ success: false, data: error });
        });
    });
});

module.exports = router;