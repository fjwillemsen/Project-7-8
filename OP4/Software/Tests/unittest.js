var moment = require('moment');
var assert = require('assert');


describe('Date Time getter', function() {
    describe('getDateTime()', function() {
        it('should return current date and time in YYYYMMDDHHmmSS format', function() {
            assert.equal(14, getDateTime().length);
        });
    });
});

describe('Empty Checker', function() {
    describe('isEmpty()', function() {
        it('should return true if empty', function() {
            var object = {};
            assert.equal(true, isEmpty(object));
        });

        it('should return false if not empty', function() {
            var object = { length: 1 };
            assert.equal(false, isEmpty(object));
        });
    });
});

// Returns YYYYMMDDHHmmSS formated DateTime
function getDateTime() {
    return moment(new Date()).format('YYYYMMDDHHmmSS');
}

// Returns true if empty, false if not
function isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
