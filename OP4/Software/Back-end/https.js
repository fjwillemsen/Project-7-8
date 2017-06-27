var restify = require('restify');
fs = require('fs');

var https_options = {
  key: fs.readFileSync('/var/www/project78/.well-known/acme-challenge/yourdomain.key'),
  certificate: fs.readFileSync('/var/www/project78/.well-known/acme-challenge/yourdomain.crt')
};
var https_server = restify.createServer(https_options);

https_server.use(restify.acceptParser(server.acceptable));
https_server.use(restify.queryParser());
https_server.use(restify.bodyParser());

https_server.listen(443, function() {
   console.log('%s listening at %s', https_server.name, https_server.url);
});