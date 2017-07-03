var assert = require('assert');
var neo4j = require('neo4j-driver').v1;

    // Process settings
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";     // Temporary fix to allow self-signed certificates (not very secure), avoids "DEPTH_ZERO_SELF_SIGNED_CERT"
process.on('uncaughtException', function (err) {    // Catch all Exceptions here to avoid crashing, log them instead
    console.log('Caught exception: ' + err.stack);
});

    // Connects to the database
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "project78SSMF"));
driver.onCompleted = function () {
    // console.log('Neo4j driver instantiation succeeded');
};
driver.onError = function (error) {
    // console.log('Neo4j driver instantiation failed', error);
};


    // Test Procedure

testDataCount(0);
for (var i = 0; i < 10; i++) {
    testAddData();
    testReturnData();
    testDataCount(i+1);
}
testDeleteData();
testDataCount(0);



    // Test Functions

// Add testdata to database
function testAddData() {
    describe('Add Test Data', function() {
        it('should add data to the database and return data or error', function(done) {
            var session = driver.session();
            session
                .run('CREATE (t:Test {testdata: {testdata}}) RETURN t', {testdata: 'This is an integration test'})
                .then(function (result) {
                    session.close();
                    result.records.forEach(function (record) {
                        describe('Added Data Returned Result', function() {
                            it('should return added test data from database', function(done) {
                                assert(record);
                                done();
                            });
                        });
                    });
                    done();
                })
                .catch(function (error) {
                    session.close();
                    console.log(error);
                    describe('Added Data Returned Error', function() {
                        it('should return error', function(done) {
                            assert(error);
                            done();
                        });
                    });
                    done();
                });
        });
    });
}

// Return testdata from database
function testReturnData() {
    describe('Return Test Data', function() {
        it('should return data from the database and return data or error', function(done) {
            var session = driver.session();
            session
                .run('MATCH (t:Test) RETURN t')
                .then(function (result) {
                    session.close();
                    result.records.forEach(function (record) {
                        describe('Data Returned Result', function() {

                            it('should return test data from database', function(done) {
                                assert(record);
                                done();
                            });

                            it('should have length of one', function(done) {
                                assert.equal(record.length, 1);
                                done();
                            });

                            var result = record._fields[0];

                            it('should return correct label type', function(done) {
                                assert.equal(typeof result.labels[0], 'string');
                                done();
                            });

                            it('should have label \'Test\'', function(done) {
                                assert.equal(result.labels[0], 'Test');
                                done();
                            });

                            it('should return correct testdata type', function(done) {
                                assert.equal(typeof result.properties.testdata,'string');
                                done();
                            });

                            it('should have property \'Testdata\' containing \'This is an integration test\'', function(done) {
                                assert.equal(result.properties.testdata, 'This is an integration test');
                                done();
                            });
                        });
                    });
                    done();
                })
                .catch(function (error) {
                    session.close();
                    console.log(error);
                    describe('Data Returned Error', function() {
                        it('should return error', function(done) {
                            assert(error);
                            done();
                        });
                    });
                    done();
                });
        });
    });
}


// Delete redundant testdata from database
function testDeleteData() {
    describe('Delete Test Data', function() {
        it('should delete test data in database and return success or error', function(done) {
            var session = driver.session();
            session
                .run('MATCH (t:Test) DELETE t')
                .then(function (result) {
                    session.close();
                    describe('Deleting Data Returned Success', function() {
                        it('should delete test data from database', function(done) {
                            assert(result);
                            done();
                        });
                    });
                    done();
                })
                .catch(function (error) {
                    session.close();
                    console.log(error);
                    describe('Deleting Data Returned Error', function() {
                        it('should return error', function(done) {
                            assert(error);
                            done();
                        });
                    });
                    done();
                });
        });
    });
}

// Read number of testdata entries from database
function testDataCount(checkCount) {
    describe('Test Data Count', function() {
        it('should return data count or error', function(done) {
            var session = driver.session();
            session
                .run('MATCH (t:Test) RETURN t')
                .then(function (result) {
                    session.close();
                    var count = 0;
                    result.records.forEach(function (record) {
                        count++;
                    });

                    describe('Correct Data Count Returned', function() {

                        it('should return', function(done) {
                            assert(result);
                            done();
                        });

                        it('should return correct data count type', function(done) {
                            assert.equal(typeof count, 'number');
                            done();
                        });

                        it('should return correct data count', function(done) {
                            assert.equal(count, checkCount);
                            done();
                        });
                    });

                    done();
                })
                .catch(function (error) {
                    session.close();
                    console.log(error);
                    describe('Counting Data Returned Error', function() {
                        it('should return error', function(done) {
                            assert(error);
                            done();
                        });
                    });
                    done();
                });
        });
    });
}
