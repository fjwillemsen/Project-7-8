    // Required
var neo4j = require('node-neo4j');
var restify = require('restify');
fs = require('fs');

    // Connects to the database
// var db = new neo4j.GraphDatabase('http://neo4j:gZb-AFF-82n-CVo@145.24.222.132:80');
var db = new neo4j('https://neo4j:neo4j@localhost:7473'); 
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
    setData(query, res);
    next();
}

// Prepares the query to get the pins from the database
function getPinsResponse(req, res, next) {
    var query = parseResponded(req.params);
    getData(query, res);
    next();
}

function pageResponse(req, res, next) {
    console.log('req: ' + req + '\nres: ' + res + '\nnext: ' + next);
    res.send(200, 'This is a page');
    next();
}




    // Database


// Executes a Create-query
function setData(query, res) {
    db.cypherQuery(query, function(err, result) {
        if(err) {
            res.send(200, {ok: 'no', error: err});
            throw err;
        } else {
            res.send(200, {ok: 'yes'});
        }
    });
}

// Gets data from the database using a query and returns a result as a list
function getData(query, res) {
    db.cypherQuery(query, function (err, results) {
        if(err) {
            res.send(200, {ok: 'no', error: err});
            throw err;
        } else {
            res.send(200, {ok: 'yes'});
        }

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
    name: 'XtremeResQ',
    key: fs.readFileSync('/var/www/project78/.well-known/acme-challenge/key.pem', 'utf8'),
    certificate: fs.readFileSync('/var/www/project78/.well-known/acme-challenge/server.crt', 'utf8')
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.bodyParser());                                   // Used for parsing the Request body
server.use(restify.queryParser());                                  // Used for allowing "?variable=value" in the URL
server.use(restify.CORS({ credentials: true }));                    // Used for allowing Access-Control-Allow-Origin

server.post('/pins/addPin', addPinResponse);                        // Add a new pin to the database

server.get('/pins/', getPinsResponse);                              // Return all pins
server.get('/pins/:responded', getPinsResponse);                    // Return all pins that are unresponded (False) to or have been responded to (True)
server.get('/page', pageResponse);
server.get(/.*/, restify.serveStatic({                              // Files are made accessible to the user, HTML index page is made default
    'directory': __dirname + '/../Front-end/',
    'default': 'index.html'
}));

// Listens for a connection
server.listen(port, function() {
    console.log('%s listening at %s', server.name, server.url);
});