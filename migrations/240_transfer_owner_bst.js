const BSTToken = artifacts.require("BSTToken");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    let _owner = config.owner;
    return BSTToken.deployed().then(bst => {
        bst.transferOwnership(_owner);
    });

};
