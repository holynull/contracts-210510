const BStablePool = artifacts.require("BStablePool");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    let _owner = config.owner;
    return BStablePool.deployed().then(pool => {
        pool.transferOwnership(_owner);
    });

};
