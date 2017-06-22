
// Required


var neo4j = require('neo4j');
var restify = require('restify');
var md5 = require('md5');
var moment = require('moment');
// var createServer = require("auto-sni");
fs = require('fs');




    // Utility Functions


// Returns YYYYMMDDHHmmSS formated DateTime
function getDateTime() {
    return moment(new Date()).format('YYYYMMDDHHmmSS');
}

    


    // Query Parsers


// Parses a Pin Create query
function parsePin(lat, long, uuid) {
    var query = 'CREATE (p:Pin { '
    query += 'lat: ' + lat + ','
    query += 'long: ' + long + ','
    query += 'uuid: ' + uuid + ','
    query += 'datetime: ' + getDateTime() + ','
    query += 'responded: ' + false
    return query + '})'
}

// Parses a Pin Responded
function parseResponded(responded) {
    return 'MATCH (p:Pin { responded: ' + responded + ' })';
}




    // Responders


// Prepares the query to add the pin to the database
function addPinResponse(req, res, next) {
    let data = JSON.parse(req.body.toString());
    let query = parsePin(data['lat', data['long'], data['uuid']]);
    createData(query);
    next();
}

// Prepares the query to get the pins from the database
function getPinsResponse(req, res, next, callback) {
    let query = parseResponded(req.params.responded);
    getData(query, res, callback);
    next();
}




    // Database


// Executes a Create-query
function createData(query) {
    db.cyper({
        query: query
    }, function (err, results) {
        if (err) throw err;
    });
}

// Gets data from the database using a query and returns a result as a list
function getData(query, res, callback) {
    db.cyper({
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






    // Server


// Set the port number that's included in the launch arguments, if it is
var port = 8081;
if(process.argv[2] && process.argv[2] != '') {
    port = process.argv[2]
}

// Connects to the database
let db = new neo4j.GraphDatabase('http://neo4j:gZb-AFF-82n-CVo@145.24.222.132:80');

// Start the server
var server = restify.createServer({
    name: 'XtremeResQ'
});

// var server = restify.createServer({ name: 'XtremeResQ', version: '1.0.0' });

// createServer({
//     email: "0911853@hr.nl", // Emailed when certificates expire.
//     agreeTos: true, // Required for letsencrypt.
//     debug: true, // Add console messages and uses staging LetsEncrypt server. (Disable in production)
//     domains: ["mysite.com", ["test.com", "www.test.com"]], // List of accepted domain names. (You can use nested arrays to register bundles with LE).
//     ports: {
//         http: 80, // Optionally override the default http port.
//         https: 443 // // Optionally override the default https port.
//     }
// }, server.server);

server.use(restify.bodyParser());                                   // Used for parsing the Request body
server.use(restify.queryParser());                                  // Used for allowing "?variable=value" in the URL
server.use(restify.CORS({ credentials: true }));                    // Used for allowing Access-Control-Allow-Origin

server.post('/pins/addPin', addPinResponse);                        // Add a new pin to the database

server.get('/pins', getPinsResponse);                               // Return all pins
server.get('/pins/:responded', getPinsResponse);                    // Return all pins that are unresponded (False) to or have been responded to (True)

// Files are made accessible to the user, HTML index page is made default
server.get(/.*/, restify.serveStatic({
    'directory': __dirname + '/../Front-end/',
    'default': 'index.html'
}));

// Listens for a connection
server.listen(port, function() {
    console.log('%s listening at %s', server.name, server.url);
});