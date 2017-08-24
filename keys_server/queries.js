var promise = require('bluebird');

var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/public_keys';
var db = pgp(connectionString);

function getKeys(req, res, next) {
    db.any('select * from keys')
    .then(function (data) {
        res.status(200)
        .json(data);
    })
    .catch(function (err) {
        return next(err);
    });
}

function getKey(req, res, next) {
    var fbID = parseInt(req.params.id);
    db.one('select * from keys where id = $1', fbID)
    .then(function (data) {
        res.status(200)
        .json(data);
    })
    .catch(function (err) {
        return next(err);
    });
}

function createKey(req, res, next) {
    console.log(req.body);
    console.log(req.query.id);
    console.log(req.body.registration_id);
    db.none('insert into keys (ID, registration_id, identity_key_pub, \
        signed_pre_key_id, signed_pre_key_pub, signed_pre_key_sig, \
        pre_key_id, pre_key_pub)' +
        'values($1, $2, $3, $4, $5, $6, $7, $8)', [
            parseInt(req.query.id),
            parseInt(req.body.registration_id),
            req.body.identity_key_pub,
            parseInt(req.body.signed_pre_key_id),
            req.body.signed_pre_key_pub,
            req.body.signed_pre_key_sig,
            parseInt(req.body.pre_key_id),
            req.body.pre_key_pub
        ])
    .then(function () {
        res.status(200)
        .json({});
    })
    .catch(function (err) {
        db.none('update keys set registration_id=$2, identity_key_pub=$3, \
        signed_pre_key_id=$4, signed_pre_key_pub=$5, signed_pre_key_sig=$6, \
        pre_key_id=$7, pre_key_pub=$8 where ID=$1', [
            parseInt(req.query.id),
            parseInt(req.body.registration_id),
            req.body.identity_key_pub,
            parseInt(req.body.signed_pre_key_id),
            req.body.signed_pre_key_pub,
            req.body.signed_pre_key_sig,
            parseInt(req.body.pre_key_id),
            req.body.pre_key_pub
        ])
        .then(function () {
            res.status(200)
            .json({});
        })
        .catch(function (err) {
            return next(err);
        });
    });
}

function updateKey(req, res, next) {
    db.none('update keys set registration_id=$2, identity_key_pub=$3, \
    signed_pre_key_id=$4, signed_pre_key_pub=$5, signed_pre_key_sig=$6, \
    pre_key_id=$7, pre_key_pub=$8 where ID=$1', [
        parseInt(req.params.id),
        parseInt(req.body.registration_id),
        req.body.identity_key_pub,
        parseInt(req.body.signed_pre_key_id),
        req.body.signed_pre_key_pub,
        req.body.signed_pre_key_sig,
        parseInt(req.body.pre_key_id),
        req.body.pre_key_pub
    ])
    .then(function () {
        res.status(200)
        .json({});
    })
    .catch(function (err) {
        return next(err);
    });
}

function removeKey(req, res, next) {
    var fbID = parseInt(req.params.id);
    db.result('delete from keys where id = $1', fbID)
    .then(function (result) {
        /* jshint ignore:start */
        res.status(200)
        .json({});
        /* jshint ignore:end */
    })
    .catch(function (err) {
        return next(err);
    });
}

module.exports = {
    getKeys: getKeys,
    getKey: getKey,
    createKey: createKey,
    updateKey: updateKey,
    removeKey: removeKey
};
