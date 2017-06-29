    // Required
var neo4j = require('neo4j-driver').v1;
var restify = require('restify');
var moment = require('moment');
var ttn = require('ttn');
fs = require('fs');

    // Process settings
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";     // Temporary fix to allow self-signed certificates (not very secure), avoids "DEPTH_ZERO_SELF_SIGNED_CERT"
process.on('uncaughtException', function (err) {    // Catch all Exceptions here to avoid crashing, log them instead
  console.log('Caught exception: ' + err.stack);
});

    // Connects to the database
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "project78SSMF"));
driver.onCompleted = function () {
  console.log('Neo4j driver instantiation succeeded');
};
driver.onError = function (error) {
  console.log('Neo4j driver instantiation failed', error);
};

function addPin(data, udid) {
    var session = driver.session();
    session
        .run('CREATE (p:Pin {lat : {lat}, long: {long}, udid: {udid}, datetime: {datetime}, responded: false }) RETURN p', {lat: data.lat, long: data.long, udid: udid, datetime: getDateTime()})
        .then(function (result) {
            result.records.forEach(function (record) {
                console.log("Added Pin: " + record);
            });
            session.close();
        })
        .catch(function (error) {
            console.log(error);
            session.close();
        });
}

function getPins(req, res, next) {
    var session = driver.session();
    var query = 'MATCH (p:Pin) RETURN p'

    // if a parameter is supplied, use it in the query
    if (req.params) {
        if (typeof req.params.responded != "undefined") {
            query = 'MATCH (p:Pin { responded: ' + req.params.responded + '}) RETURN p';
        }
    }

    session
        .run(query)
        .then(function (result) {

            var results = [];
            var count = 0;
            result.records.forEach(function (record) {
                results[count] = record;
                count++;
            });

            var final = { result: results, length: count };
            res.send(200, {
                ok: 'yes',
                query: query,
                result: final
            });

            session.close();
        })
        .catch(function (error) {
            console.log(error);
            res.send(200, {
                ok: 'no',
                query: query,
                error: error
            });
        });

    return next();
}
 


    // Utility Functions


// Returns YYYYMMDDHHmmSS formated DateTime
function getDateTime() {
    return moment(new Date()).format('YYYYMMDDHHmmSS');
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}



    // LoRa Receiver
    
// Login    
var region = 'eu';
var appID = 'sosbutton';
var accessKey = 'ttn-account-v2._OUW0ngQcd2i81hAvn6deR3gKj_RIPTQ-U8RvWf5pRk';
var client = new ttn.Client(region, appID, accessKey);

// If connection
client.on('connect', function(connack) {
    console.log('[DEBUG]', 'Connect:', connack);
});   

// If error
client.on('error', function(err) {
    console.error('[ERROR]', err.message);
});

// Receives a message
client.on('message', function(deviceId, data) {
    console.info('[INFO] ', 'Message:', deviceId, JSON.stringify(data, null, 2));
    var payload_raw = new Buffer(data.payload_raw, 'base64').toString()
    var payload = JSON.parse(payload_raw.replace(/\\"/g, '"'));
    var udid = data.hardware_serial;
    console.log(payload);
    addPin(payload, udid);
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

// Server features
server.use(restify.authorizationParser());
server.use(restify.bodyParser());                                   // Used for parsing the Request body
server.use(restify.acceptParser(server.acceptable));
server.use(restify.CORS());                                         // Used for allowing Access-Control-Allow-Origin

// Server endpoints
server.get('/get/pins/', getPins);                                  // Return all pins
server.get('/get/pins/:responded', getPins);                        // Return all pins that are unresponded (False) to or have been responded to (True)
server.get(/.*/, restify.serveStatic({                              // Files are made accessible to the user, HTML index page is made default
    'directory': __dirname + '/../Front-end/',
    'default': 'index.html'
}));

// Listens for a connection
server.listen(port, function() {
    console.log('%s listening at %s', server.name, server.url);
});