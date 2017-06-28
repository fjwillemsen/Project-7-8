'use strict';

var data = require('./data');
var regions = require('./regions');

module.exports = {
  Client: data.MQTT, // DEPRECATED
  regions: regions.regions,

  data: data,
  manager: require('./manager')
};