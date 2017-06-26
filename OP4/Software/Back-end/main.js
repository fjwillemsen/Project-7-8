
    // Required
var neo4j = require('node-neo4j');
var restify = require('restify');
// var createServer = require("auto-sni");

    // Connects to the database
// var db = new neo4j.GraphDatabase('http://neo4j:gZb-AFF-82n-CVo@145.24.222.132:80');
var db = new neo4j('http://neo4j:neo4j@localhost:7474'); 
console.log(db);
// setData(parsePin(51.75, 4.2, 3));



    // Utility Functions


// Returns YYYYMMDDHHmmSS formated DateTime
function getDateTime() {
    return moment(new Date()).format('YYYYMMDDHHmmSS');
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}


    // Query Parsers


// Parses a Pin Create query
function parsePin(lat, long, udid) {
    var query = 'CREATE (p:Pin { '
    query += 'lat: ' + lat + ','
    query += 'long: ' + long + ','
    query += 'udid: ' + udid + ','
    query += 'datetime: ' + getDateTime() + ','
    query += 'responded: ' + false
    return query + '})'
}

// Parses a Pin Responded
function parseResponded(args) {
    if(!isEmpty(args)) {
        return 'MATCH (p:Pin { responded: ' + args.responded + ' }) RETURN p';
    } else {
        return 'MATCH (p:Pin) RETURN p';
    }
}




    // Responders


// Prepares the query to add the pin to the database
function addPinResponse(req, res, next) {
    var data = JSON.parse(req.body.toString());
    var query = parsePin(data['lat', data['long'], data['uuid']]);
    setData(query);
    next();
}

// Prepares the query to get the pins from the database
function getPinsResponse(req, res, next) {
    var query = parseResponded(req.params);
    getData(query, res);
    next();
}




    // Database


// Executes a Create-query
function setData(query) {
    db.cypherQuery(query, function(err, result) {
        if(err) throw err;
    });
}

// Gets data from the database using a query and returns a result as a list
function getData(query, res) {
    db.cypherQuery(query, function (err, results) {
        if (err) throw err;
        var result = results.data;

        if (result.length == 0) {
            console.log('No object found for ' + query);
            res.send(200, {ok: 'no'});
        } else {

            var data = result[0];
            var response = {
                length: result.length
            };

            for (var i = result.length - 1; i >= 0; i--) {
                response[i] = result[i];
            }

            console.log(response);
            res.send(200, response);
        }
    });
}






    // Server


// Set the port number that's included in the launch arguments, if it is
var port = 8081;
if(process.argv[2] && process.argv[2] != '') {
    port = process.argv[2]
}

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

server.get('/pins/', getPinsResponse);                               // Return all pins
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