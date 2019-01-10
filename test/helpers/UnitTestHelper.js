'use strict';

const _ = require('lodash');
const assert = require('assert');
const sinon = require('sinon');

const unitTestHelper = {
    createPromise: () => {
        const temp = {};
        const promise = new Promise((fulfill, reject) => {
            temp.fulfill = function () {
                fulfill.apply(null, arguments);
                return promise;
            };
            temp.reject = function () {
                promise.catch(() => {
                });
                reject.apply(null, arguments);
                return promise;
            };
        });
        return Object.assign(promise, temp);
    },
    collections: function() {
        const result = {};

        _.toArray(arguments).forEach((collectionName) => {
            result[collectionName] = unitTestHelper.fakeCollection();
        });

        return result;
    },

    fakeDatabase: (collections) => {
        return {
            collection: (name) => {
                return collections[name];
            }
        };
    },

    fakeCollection: () => {
        const fakeCursor = unitTestHelper.fakeCursor();
        return {
            insert: () => {},
            update: () => {},
            updateOne: () => {},
            updateMany: () => {},
            remove: () => {},
            find: () => fakeCursor,
            findOne: () => {},
            distinct: () => {},
            findAndModify: () => {},
            createIndex: () => {},
            fakeCursor
        };
    },

    fakeCursor: () => {
        return {
            limit: function() {
                return this;
            },
            sort: function() {
                return this;
            },
            toArray: () => Promise.resolve()
        };
    },

    wrapVerification: (sandbox, done, verificationFunction) => {
        if (!_.isFunction(done)) {
            throw new Error('Must provide "done" function.');
        }
        if (!_.isFunction(verificationFunction)) {
            if (_.isUndefined(verificationFunction)) {
                verificationFunction = sandbox.verify.bind(sandbox);
            } else {
                throw new Error('Second parameter to wrapVerification must be a verification function or undefined.');
            }
        }

        return function() {
            try {
                const result = verificationFunction.apply(this, arguments);
                done();
                return result;
            } catch (error) {
                done(error);
            }
        };
    },

    fakeApp: () => {
        return {
            all: () => {},
            delete: () => {},
            get: () => {},
            patch: () => {},
            post: () => {},
            put: () => {},

            allWithApi: () => {},
            deleteWithApi: () => {},
            getWithApi: () => {},
            patchWithApi: () => {},
            postWithApi: () => {},
            putWithApi: () => {}
        };
    },

    response: () => {
        const response = {
            status: () => {
                return response;
            },
            sendStatus: (status) => {
                response.status(status);
                response.send();
            },
            send: () => {
                return response;
            }
        };
        return response;
    },
    createDefaultDatabase: (sandbox) => {
        if (!_.isFunction(process.on.restore)) {
            sandbox.stub(process, 'on');
        }
        return {
            collection: () => {
                return {
                    aggregate: () => {},
                    count: () => {},
                    distinct: () => {},
                    find: () => {},
                    findAndModify: () => {},
                    findOne: () => {},
                    insert: () => {},
                    remove: () => {},
                    update: () => {}
                };
            }
        };
    },
    assertMatchBlockedImpression: (bi, comparison) => {
        if (_.isArray(bi)) {
            if (_.isArray(comparison)) {
                assert.strictEqual(bi.length, comparison.length);
                for (let i = 0; i < bi.length; i++) {
                    assert(bi[i].isValid(), 'blocked impression has missing mandatory fields');
                    unitTestHelper.assertMatchBlockedImpression(bi[i], comparison[i]);
                }
            } else {
                assert.strictEqual(bi.length, 1);
                assert(bi[0].isValid(), 'blocked impression has missing mandatory fields');
                unitTestHelper.assertMatchBlockedImpression(bi[0], comparison);
            }
        } else {
            assert(bi.isValid(), 'blocked impression has missing mandatory fields');

            const impressionKeys = Object.keys(comparison);
            const filteredImpression = _.pick(bi, impressionKeys);
            assert.deepStrictEqual(filteredImpression, comparison);

            if (comparison.debug) {
                const debugKeys = Object.keys(comparison.debug);
                const filteredDebug = _.pick(bi.debug, debugKeys);
                assert.deepStrictEqual(filteredDebug, comparison.debug);
            }
        }
    },
    stubDatabase: (sandbox, stubbedCollections, database) => {
        database = database || unitTestHelper.createDefaultDatabase();
        const collections = {};
        stubbedCollections.forEach((collectionName) => {
            collections[collectionName] = database.collection(collectionName);
        });

        sandbox.stub(database, 'collection').callsFake((collectionName) => {
            return collections[collectionName];
        });
    },
    matchFunctionName: (expectedName) => {
        return sinon.match(function(value) {
            if (value.name !== expectedName) {
                return false;
            }
            return true;
        });
    }
};

module.exports = unitTestHelper;
