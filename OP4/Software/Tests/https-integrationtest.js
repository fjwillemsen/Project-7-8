var assert = require('assert');
var request = require('request');

    // Process settings
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";     // Temporary fix to allow self-signed certificates (not very secure), avoids "DEPTH_ZERO_SELF_SIGNED_CERT"
process.on('uncaughtException', function (err) {    // Catch all Exceptions here to avoid crashing, log them instead
    console.log('Caught exception: ' + err.stack);
});

describe('Get Pins Test', function() {
    it('should not return an error', function(done) {
        request.get('https://xtremeresq.ddns.net:8081/get/pins', {json: true}, function(err, res, body) {
            assert(!err);
            done();
        });
    });
    it('should return status code 200', function(done) {
        request.get('https://xtremeresq.ddns.net:8081/get/pins', {json: true}, function(err, res, body) {
            assert.equal(res.statusCode, 200);
            done();
        });
    });
    it('should return body.ok equals yes', function(done) {
        request.get('https://xtremeresq.ddns.net:8081/get/pins', {json: true}, function(err, res, body) {
            assert.equal(body.ok, 'yes');
            done();
        });
    });
    it('should return correct body.query', function(done) {
        request.get('https://xtremeresq.ddns.net:8081/get/pins', {json: true}, function(err, res, body) {
            assert.equal(body.query, 'MATCH (p:Pin) RETURN p ORDER BY p.datetime DESC');
            done();
        });
    });
    it('should return result with length', function(done) {
        request.get('https://xtremeresq.ddns.net:8081/get/pins', {json: true}, function(err, res, body) {
            assert(body.result.length > 0);
            done();
        });
    });
    it('should return result with properties', function(done) {
        request.get('https://xtremeresq.ddns.net:8081/get/pins', {json: true}, function(err, res, body) {
            var result = body.result.result[0]._fields[0].properties
            assert(result.datetime);
            assert(result.udid);
            assert(result.lat);
            assert(result.long);
            done();
        });
    });
});
