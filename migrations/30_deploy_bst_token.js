const BSTToken = artifacts.require("BSTToken");
const BSTMinter = artifacts.require("BSTMinter");
const HuaHuaToken = artifacts.require('HuaHuaToken');
const data = require('./conf');

module.exports = function (deployer, network, accounts) {
    let config = data[deployer.network_id];
    return BSTMinter.deployed().then(minter => {
        let perf = investors => {
            return deployer.deploy(BSTToken, accounts[0], minter.address, investors).then(res => {
                console.log('constructor[0]:' + accounts[0]);
                console.log('constructor[1]:' + minter.address);
                console.log('constructor[2]:' + JSON.stringify(investors));
            });
        };
        if (config.huahua) {
            return HuaHuaToken.at(config.huahua).then(huahua => {
                return huahua.getHoldersLength().then(res => {
                    let len = Number(res.toString());
                    let arr = new Array();
                    for (let i = 1; i < len; i++) {
                        arr.push(huahua.holders(i));
                    }
                    return Promise.all(arr).then(holders => {
                        return perf(holders);
                    });
                });
            }).catch(e=>{
                console.error(e);
            });
        } else {
            return perf(config.investors).catch(e=>{
                console.error(e);
            });
        }
    });
};
