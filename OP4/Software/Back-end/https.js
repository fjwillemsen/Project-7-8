var restify = require('restify');
fs = require('fs');

var https_options = {
  key: fs.readFileSync('/var/www/project78/.well-known/acme-challenge/key.pem', 'utf8'),
  certificate: fs.readFileSync('/var/www/project78/.well-known/acme-challenge/server.crt', 'utf8')
};
var https_server = restify.createServer(https_options);

https_server.use(restify.acceptParser(server.acceptable));
https_server.use(restify.queryParser());
https_server.use(restify.bodyParser());

server.get(/.*/, restify.serveStatic({
    'directory': __dirname + '/../Front-end/',
    'default': 'index.html'
}));

https_server.listen(8082, function() {
   console.log('%s listening at %s', https_server.name, https_server.url);
});