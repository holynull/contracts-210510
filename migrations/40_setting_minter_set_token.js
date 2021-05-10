const BSTToken = artifacts.require("BSTToken");
const BSTMinter = artifacts.require("BSTMinter");
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    return BSTMinter.deployed().then(minter => {
        return BSTToken.deployed().then(bst => {
            return minter.setToken(bst.address);
        });
    });
};
