const BSTMinter = artifacts.require("BSTMinter");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    let _owner = config.owner;
    return BSTMinter.deployed().then(minter => {
        minter.transferOwnership(_owner);
    });

};
