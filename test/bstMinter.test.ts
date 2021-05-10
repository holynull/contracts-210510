import { expect, assert } from 'chai';
import {
    BSTMinterContract,
    BSTMinterInstance,
    BSTTokenContract,
    BSTTokenInstance,
    PaymentFarmingProxyContract,
    PaymentFarmingProxyInstance,
    LiquidityFarmingProxyContract,
    LiquidityFarmingProxyInstance
} from '../build/types/truffle-types';
// Load compiled artifacts
const bstMinterContract: BSTMinterContract = artifacts.require('BSTMinter.sol');
const bstContract: BSTTokenContract = artifacts.require('BSTToken.sol');
const paymentProxyContract: PaymentFarmingProxyContract = artifacts.require('PaymentFarmingProxy.sol');
const liquidityProxyContract: LiquidityFarmingProxyContract = artifacts.require('LiquidityFarmingProxy.sol');
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
import { BigNumber } from 'bignumber.js';
import { config } from './config';

contract('Halving Release', async accounts => {

    let minter: BSTMinterInstance;
    let bst: BSTTokenInstance;
    let payment: PaymentFarmingProxyInstance;
    let liquidity: LiquidityFarmingProxyInstance;
    let denominator = new BigNumber(10).exponentiatedBy(18);

    before('Get proxy contract instance', async () => {
        minter = await bstMinterContract.deployed();
        bst = await bstContract.deployed();
        payment = await paymentProxyContract.deployed();
        liquidity = await liquidityProxyContract.deployed();
    });


    describe('Test mint', async () => {

        it('Mint', async () => {
            let sta = new Date().getTime();
            let end = sta + 3600 * 4 * 1000;
            let phase = new BigNumber(0);
            console.log(new BigNumber(await minter.totalAllocPoint()).toFormat(18, BigNumber.ROUND_DOWN));
            console.log(await minter.proxyAddresses(0));
            console.log(await minter.proxyAddresses(1));
            console.log('minter: ' + await bst.minter());
            console.log('minter: ' + minter.address);
            console.log(await minter.bstToken());
            console.log(bst.address);
            console.log(await minter.devaddr());
            console.log(JSON.stringify(await minter.proxyInfo(await minter.proxyAddresses(0))));
            console.log(JSON.stringify(await minter.proxyInfo(await minter.proxyAddresses(1))));
            console.log(new BigNumber(await bst.totalSupply()).toFormat(0));
            for (; true;) {
                let now = Date.now();
                if (now >= end) {
                    break;
                }
                let _phase = new BigNumber(await minter.phase());
                // console.log(_phase);
                // let r = new BigNumber(await minter.getReward(await minter.proxyAddresses(0)));
                // console.log(r.toFormat(0));
                // r = new BigNumber(await minter.getReward(await minter.proxyAddresses(1)));
                // console.log(r.toFormat(0));
                // let pAddress1 = await minter.proxyAddresses(0);
                // let pAddress2 = await minter.proxyAddresses(1);
                // let res1 = await minter.mint(pAddress1, 1, 1);
                // let res2 = await minter.mint(pAddress2, 1, 1);
                await minter.massMint();
                let totalSupply = new BigNumber(await bst.totalSupply());
                // console.log('BST totalSupply: ' + totalSupply.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
                if (_phase.comparedTo(phase) > 0) {
                    console.log('BST totalSupply: ' + totalSupply.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
                    console.info('Phase: ' + _phase);
                    phase=_phase;
                }
                // delay(500);
            }
        }).timeout(84600 * 1000);
    });

});
