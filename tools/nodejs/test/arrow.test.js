var sqlite3 = require('..');
var assert = require('assert');
var fs = require('fs');

describe('exec', function() {
    var db;
    before(function(done) {
        db = new sqlite3.Database(':memory:', done);
    });

    // Note: arrow IPC api requires the arrow extension to be loaded. The tests for this functionality reside in:
    //       https://github.com/duckdblabs/arrow
    describe(`Arrow IPC API fails neatly when extension not loaded`, () => {
        let db;
        let conn;
        before((done) => {
            db = new sqlite3.Database(':memory:', {"allow_unsigned_extensions": "true"}, () => {
                done();
            });
        });

        it(`Basic examples`, async () => {
            const range_size = 130000;
            const query = `SELECT * FROM range(0,${range_size}) tbl(i)`;

            db.arrowIPCStream(query).then(
                () => Promise.reject(new Error('Expected method to reject.')),
                err => {
                    assert(err.message.includes("Catalog Error: Function with name to_arrow_ipc is not on the catalog, but it exists in the arrow extension. To Install and Load the extension, run: INSTALL arrow; LOAD arrow;"))
                }
            );

            db.arrowIPCAll(`SELECT * FROM ipc_table`, function (err, result) {
                if (err) {
                    assert(err.message.includes("Catalog Error: Function with name to_arrow_ipc is not on the catalog, but it exists in the arrow extension. To Install and Load the extension, run: INSTALL arrow; LOAD arrow;"))
                } else {
                    assert.fail("Expected error");
                }
            });

            assert.throws(() => db.register_buffer("ipc_table", [1,'a',1], true), TypeError, "Incorrect parameters");
        });

        it('Register buffer should be disabled currently', function(done) {
            try {
                db.register_buffer();
                assert(0);
            } catch (error) {
                assert(error.message.includes('Register buffer currently not implemented'))
            }

            try {
                db.unregister_buffer();
                assert(0);
            } catch (error) {
                assert(error.message.includes('Register buffer currently not implemented'))
            }
            done()
        });
    });
});
