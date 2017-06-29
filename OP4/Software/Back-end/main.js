    // Required
var neo4j = require('neo4j-driver').v1;
var restify = require('restify');
var moment = require('moment');
var ttn = require('ttn');
fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";     // Temporary fix to allow self-signed certificates (not very secure), avoids "DEPTH_ZERO_SELF_SIGNED_CERT"
process.on('uncaughtException', function (err) {    // Catch all Exceptions here to avoid crashing, log them instead
  console.log('Caught exception: ' + err.stack);
});

    // Connects to the database
var driver = neo4j.driver("bolt://xtremeresq.ddns.net:7687", neo4j.auth.basic("neo4j", "prject78SSMF"));
driver.onCompleted = function () {
  console.log(driver);
};
driver.onError = function (error) {
  console.log('Neo4j driver instantiation failed', error);
};

function addPin(data, deviceId) {
    var session = driver.session();
    session
      .run('CREATE (p:Pin {lat : {lat}, long: {long}, udid: {udid}, datetime: {datetime}, responded: false }) RETURN p', {lat: data.lat, long: data.long, udid: deviceId, datetime: getDateTime()})
      .subscribe({
        onNext: function (record) {
          console.log(record.get('lat'));
        },
        onCompleted: function () {
          session.close();
        },
        onError: function (error) {
          console.log(error);
        }
    });
}
 


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
    return query + '}) RETURN p;'
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
    console.log(req.params);
    var data = req.params;
    var query = parsePin(data.lat, data.long, data.uuid);
    setData(query, res);
    return next();
}

// Prepares the query to get the pins from the database
function getPinsResponse(req, res, next) {
    var query = parseResponded(req.params);
    getData(query, res);
    return next();
}


    // Database


// Executes a Create-query
function setData(query, res) {
    db.cypherQuery(query, function(err, result) {
        if(err) {
            res.send(200, {
                ok: 'no',
                query: query,
                error: err
            }); throw err;
        } 

        else {
            res.send(200, {
                ok: 'yes',
                query: query
            });
        }
    });
}

// Gets data from the database using a query and returns a result as a list
function getData(query, res) {
    db.cypherQuery(query, function (err, results) {
        if(err) {
            res.send(200, {
                ok: 'no',
                query: query,
                error: err
            }); throw err;
        }

        var result = results.data;

        if (result.length == 0) {
            res.send(200, {
                ok: 'no',
                query: query,
                error: err
            }); throw err;
        } else {

            var data = result[0];
            var response = {
                ok: 'yes',
                query: query,
                length: result.length
            };

            for (var i = result.length - 1; i >= 0; i--) {
                response[i] = result[i];
            }

            res.send(200, response);
        }
    });
}



    // LoRa Receiver
    
var region = 'eu';
var appID = 'sosbutton';
var accessKey = 'ttn-account-v2._OUW0ngQcd2i81hAvn6deR3gKj_RIPTQ-U8RvWf5pRk';
var client = new ttn.Client(region, appID, accessKey);

client.on('connect', function(connack) {
    console.log('[DEBUG]', 'Connect:', connack);
});
    
client.on('error', function(err) {
    console.error('[ERROR]', err.message);
});

client.on('message', function(deviceId, data) {
    console.info('[INFO] ', 'Message:', deviceId, JSON.stringify(data, null, 2));
    console.log(deviceId);
    var payload_raw = new Buffer(data.payload_raw, 'base64').toString()
    var payload = JSON.parse(payload_raw.replace(/\\"/g, '"'));
    console.log(payload);
    addPin(payload, deviceId);
});




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

server.use(restify.authorizationParser());
server.use(restify.bodyParser());                                   // Used for parsing the Request body
server.use(restify.acceptParser(server.acceptable));
server.use(restify.CORS());                                         // Used for allowing Access-Control-Allow-Origin

server.post('/add/pins', addPinResponse);                           // Add a new pin to the database
server.post("/testpost", function(req, res, next) {                 // Test a post-endpoint
    console.log(req.body);
    console.log(req.params);
    res.send(200, { ok: 'yes' });
});

server.get('/get/pins/', getPinsResponse);                          // Return all pins
server.get('/get/pins/:responded', getPinsResponse);                // Return all pins that are unresponded (False) to or have been responded to (True)
server.get(/.*/, restify.serveStatic({                              // Files are made accessible to the user, HTML index page is made default
    'directory': __dirname + '/../Front-end/',
    'default': 'index.html'
}));

// Listens for a connection
server.listen(port, function() {
    console.log('%s listening at %s', server.name, server.url);
});