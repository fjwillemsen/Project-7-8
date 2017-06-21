var neo4j = require('neo4j');
var restify = require('restify');
var md5 = require('md5');
fs = require('fs');

// Set the port number that's included in the launch arguments, if it is
var port = 8081;
if(process.argv[2] && process.argv[2] != '') {
    port = process.argv[2]
}


//Connects to the database
var db = new neo4j.GraphDatabase('http://neo4j:gZb-AFF-82n-CVo@145.24.222.132:80');

function getAllUnresponded(query, res, getter, callback) {
    
}

//Executes a query on the database and returns the data to the original caller
function filter(query, res, getter, callback) {
    if(getter == undefined) {
        getter = 'o';
    }

    db.cypher({
        query: query
    }, function (err, results) {

        if (err) throw err;
        var response = {
            length: results.length.toString()
        };

        var result = results[0];
        if (!result) {
            console.log('No object found.');
            response = {ok: 'no'};
            res.send(200, response);
        } else {
            for (var i = results.length - 1; i >= 0; i--) {
                response[i] = results[i][getter];
            }

            res.send(200, response);
            callback(response);
        }
    });
}

//Wishlist
function viewWishListRespond(req, res, next) {
    var data = JSON.parse(req.body.toString());
    var query = 'MATCH (u:User { username: \'' + data['wishlistusername'] + '\'})-[:WISHES]-(c:Car) return c';
    db.cypher({ query: query }, function(err, results) {
        if(!results[0]) { //If the requested user's wishlist is not public, check if it is the logged in users' wishlist
            query = 'MATCH (u:User { username: \'' + data['wishlistusername'] + '\', password: \'' + data['password'] + '\'})-[:WISHES]-(c:Car) return c';
            db.cypher({ query: query}, function(err, results) {
                if(results[0]) {
                    var response = { length: results.length.toString() };
                    for (var i = results.length - 1; i >= 0; i--) {
                        response[i] = results[i]['c'];
                    }
                    res.send(200, response);
                }
            });
        } else {
            var response = { length: results.length.toString() };
            for (var i = results.length - 1; i >= 0; i--) {
                response[i] = results[i]['c'];
            }
            res.send(200, response);
        }
    });
    next();
}



// Start the server
var server = restify.createServer({
    name: 'XtremeResQ'
});

server.use(restify.bodyParser());                                   // Used for parsing the Request body
server.use(restify.queryParser());                                  // Used for allowing "?variable=value" in the URL
server.use(restify.CORS({ credentials: true }));                    // Used for allowing Access-Control-Allow-Origin

server.get('/search/:value', searchRespond);                        // Allows users to search by make, model and year
server.post('/wl', viewWishListRespond);                            // View the wishlist

// Files are made accessible to the user, HTML index page is made default
server.get(/.*/, restify.serveStatic({
    'directory': __dirname + '/../Front-end/',
    'default': 'index.html'
}));

// Listens for a connection
server.listen(port, function() {
    console.log('%s listening at %s', server.name, server.url);
});