import { expect, assert } from 'chai';
import {
    BSTMinterContract,
    BSTMinterInstance,
    BSTTokenContract,
    BSTTokenInstance,
    PaymentFarmingProxyContract,
    PaymentFarmingProxyInstance,
    LiquidityFarmingProxyContract,
    LiquidityFarmingProxyInstance,
    TokenQUSDContract,
    TokenQUSDInstance,
    TokenBUSDContract,
    TokenBUSDInstance,
    TokenDAIContract,
    TokenDAIInstance,
    TokenUSDTContract,
    TokenUSDTInstance,
    TokenUSDCContract,
    TokenUSDCInstance,
    BStablePool1Contract,
    BStablePool1Instance,
    BStablePool2Contract,
    BStablePool2Instance,
    BStablePoolContract,
    BStablePoolInstance
} from '../build/types/truffle-types';
// Load compiled artifacts
const bstMinterContract: BSTMinterContract = artifacts.require('BSTMinter.sol');
const bstContract: BSTTokenContract = artifacts.require('BSTToken.sol');
const paymentProxyContract: PaymentFarmingProxyContract = artifacts.require('PaymentFarmingProxy.sol');
const liquidityProxyContract: LiquidityFarmingProxyContract = artifacts.require('LiquidityFarmingProxy.sol');
const daiContract: TokenDAIContract = artifacts.require('TokenDAI.sol');
const qusdContract: TokenQUSDContract = artifacts.require('TokenQUSD.sol');
const busdContract: TokenBUSDContract = artifacts.require('TokenBUSD.sol');
const usdtContract: TokenUSDTContract = artifacts.require('TokenUSDT.sol');
const usdcContract: TokenUSDCContract = artifacts.require('TokenUSDC.sol');
const pool1Contract: BStablePool1Contract = artifacts.require('BStablePool1.sol');
const pool2Contract: BStablePool2Contract = artifacts.require('BStablePool2.sol');
const pool3Contract: BStablePoolContract = artifacts.require('BStablePool.sol');
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
import { BigNumber } from 'bignumber.js';
import { config } from './config';

contract('Halving Release', async accounts => {

    let minter: BSTMinterInstance;
    let bst: BSTTokenInstance;
    let payment: PaymentFarmingProxyInstance;
    let liquidity: LiquidityFarmingProxyInstance;
    let denominator = new BigNumber(10).exponentiatedBy(18);
    let dai: TokenDAIInstance;
    let qusd: TokenQUSDInstance;
    let busd: TokenBUSDInstance;
    let usdt: TokenUSDTInstance;
    let usdc: TokenUSDCInstance;
    let pool1: BStablePool1Instance;
    let pool2: BStablePool2Instance;
    let pool3: BStablePoolInstance;
    let MAX_UNIT256 = new BigNumber(2).exponentiatedBy(256).minus(1);

    before('Get proxy contract instance', async () => {
        minter = await bstMinterContract.deployed();
        bst = await bstContract.deployed();
        payment = await paymentProxyContract.deployed();
        liquidity = await liquidityProxyContract.deployed();
        dai = await daiContract.deployed();
        qusd = await qusdContract.deployed();
        busd = await busdContract.deployed();
        usdt = await usdtContract.deployed();
        usdc = await usdcContract.deployed();
        pool1 = await pool1Contract.deployed();
        pool2 = await pool2Contract.deployed();
        pool3 = await pool3Contract.deployed();
    });


    describe('Test farming', async () => {

        it('Addliquidity to 3 Pools', async () => {
            await dai.approve(pool1.address, MAX_UNIT256.toFixed(0));
            await busd.approve(pool1.address, MAX_UNIT256.toFixed(0));
            await usdt.approve(pool1.address, MAX_UNIT256.toFixed(0));
            let amt = web3.utils.toWei('10000', 'ether');
            await pool1.add_liquidity([amt, amt, amt], 0);

            await qusd.approve(pool2.address, MAX_UNIT256.toFixed(0));
            await busd.approve(pool2.address, MAX_UNIT256.toFixed(0));
            await usdt.approve(pool2.address, MAX_UNIT256.toFixed(0));
            await pool2.add_liquidity([amt, amt, amt], 0);

            await usdc.approve(pool3.address, MAX_UNIT256.toFixed(0));
            await busd.approve(pool3.address, MAX_UNIT256.toFixed(0));
            await usdt.approve(pool3.address, MAX_UNIT256.toFixed(0));
            await pool3.add_liquidity([amt, amt, amt], 0);
            console.log('Pool1 lp balance: ' + new BigNumber(await pool1.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Pool2 lp balance: ' + new BigNumber(await pool2.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Pool3 lp balance: ' + new BigNumber(await pool3.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
        }).timeout(84600 * 1000);

        it('Mass up Mint', async () => {
            for (let i = 0; i < 10; i++) {
                await minter.massMint();
            }
            console.log('Liquidity Minted BST: ' + new BigNumber(await bst.balanceOf(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Payment Minted BST: ' + new BigNumber(await bst.balanceOf(payment.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
        });

        it('Deposit LP 1st time', async () => {
            await pool1.approve(liquidity.address, MAX_UNIT256.toFixed(0));
            await pool2.approve(liquidity.address, MAX_UNIT256.toFixed(0));
            await pool3.approve(liquidity.address, MAX_UNIT256.toFixed(0));
            console.log('Reward pending: ' + new BigNumber(await minter.getReward(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let pendingBST1 = new BigNumber(await liquidity.pendingReward(0, accounts[0]));
            let pendingBST2 = new BigNumber(await liquidity.pendingReward(1, accounts[0]));
            let pendingBST3 = new BigNumber(await liquidity.pendingReward(2, accounts[0]));
            console.log('BST pending pool1: ' + pendingBST1.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST pending pool2: ' + pendingBST2.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST pending pool3: ' + pendingBST3.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let amt = web3.utils.toWei('100', 'ether');
            await liquidity.deposit(0, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            await liquidity.deposit(1, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            await liquidity.deposit(2, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            console.log('Pool1 lp balance: ' + new BigNumber(await pool1.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Pool2 lp balance: ' + new BigNumber(await pool2.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Pool3 lp balance: ' + new BigNumber(await pool3.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            for (let i = 0; i < 10; i++) {
                await minter.massMint();
            }
            let poolInfo1 = await liquidity.poolInfo(0);
            let poolInfo2 = await liquidity.poolInfo(1);
            let poolInfo3 = await liquidity.poolInfo(2);
            let totalallocPoint = new BigNumber(await liquidity.totalAllocPoint());
            console.log('Liquidity Minted BST: ' + new BigNumber(await bst.balanceOf(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Payment Minted BST: ' + new BigNumber(await bst.balanceOf(payment.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Pool1 Info: ' + JSON.stringify(poolInfo1));
            console.log('Pool2 Info: ' + JSON.stringify(poolInfo2));
            console.log('Pool3 Info: ' + JSON.stringify(poolInfo3));
            console.log('Pool1 allocPoint: ' + new BigNumber(poolInfo1[1]).toFixed(0) + '/' + totalallocPoint.toFixed(0));
            console.log('Pool2 allocPoint: ' + new BigNumber(poolInfo2[1]).toFixed(0) + '/' + totalallocPoint.toFixed(0));
            console.log('Pool3 allocPoint: ' + new BigNumber(poolInfo3[1]).toFixed(0) + '/' + totalallocPoint.toFixed(0));

            console.log('BST balance: ' + new BigNumber(await bst.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
        }).timeout(84600 * 1000);

        it('Deposit LP 2nd time', async () => {
            console.log('Liquidity Minted BST: ' + new BigNumber(await bst.balanceOf(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Payment Minted BST: ' + new BigNumber(await bst.balanceOf(payment.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            await pool1.approve(liquidity.address, MAX_UNIT256.toFixed(0));
            await pool2.approve(liquidity.address, MAX_UNIT256.toFixed(0));
            await pool3.approve(liquidity.address, MAX_UNIT256.toFixed(0));
            let pendingBST1 = new BigNumber(await liquidity.pendingReward(0, accounts[0]));
            let pendingBST2 = new BigNumber(await liquidity.pendingReward(1, accounts[0]));
            let pendingBST3 = new BigNumber(await liquidity.pendingReward(2, accounts[0]));
            console.log('BST pending pool1: ' + pendingBST1.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST pending pool2: ' + pendingBST2.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST pending pool3: ' + pendingBST3.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let amt = web3.utils.toWei('100', 'ether');
            await liquidity.deposit(0, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            await liquidity.deposit(1, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            await liquidity.deposit(2, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            let poolInfo1 = await liquidity.poolInfo(0);
            let poolInfo2 = await liquidity.poolInfo(1);
            let poolInfo3 = await liquidity.poolInfo(2);
            console.log('Pool1 Info: ' + JSON.stringify(poolInfo1));
            console.log('Pool2 Info: ' + JSON.stringify(poolInfo2));
            console.log('Pool3 Info: ' + JSON.stringify(poolInfo3));
            console.log('BST balance: ' + new BigNumber(await bst.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
        }).timeout(84600 * 1000);

        it('Withdraw LP', async () => {
            console.log('Liquidity Minted BST: ' + new BigNumber(await bst.balanceOf(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Payment Minted BST: ' + new BigNumber(await bst.balanceOf(payment.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let pendingBST1 = new BigNumber(await liquidity.pendingReward(0, accounts[0]));
            let pendingBST2 = new BigNumber(await liquidity.pendingReward(1, accounts[0]));
            let pendingBST3 = new BigNumber(await liquidity.pendingReward(2, accounts[0]));
            console.log('BST pending pool1: ' + pendingBST1.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST pending pool2: ' + pendingBST2.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST pending pool3: ' + pendingBST3.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let amt = web3.utils.toWei('10', 'ether');
            await liquidity.withdraw(0, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            await liquidity.withdraw(1, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            await liquidity.withdraw(2, amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            pendingBST1 = new BigNumber(await liquidity.pendingReward(0, accounts[0]));
            pendingBST2 = new BigNumber(await liquidity.pendingReward(1, accounts[0]));
            pendingBST3 = new BigNumber(await liquidity.pendingReward(2, accounts[0]));
            console.log('BST pending pool1: ' + pendingBST1.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST pending pool2: ' + pendingBST2.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST pending pool3: ' + pendingBST3.div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Pool1 lp balance: ' + new BigNumber(await pool1.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Pool2 lp balance: ' + new BigNumber(await pool2.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Pool3 lp balance: ' + new BigNumber(await pool3.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST balance: ' + new BigNumber(await bst.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
        }).timeout(84600 * 1000);

        it('Mass up Mint', async () => {
            for (let i = 0; i < 10; i++) {
                await minter.massMint();
            }
            console.log('Liquidity Minted BST: ' + new BigNumber(await bst.balanceOf(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Payment Minted BST: ' + new BigNumber(await bst.balanceOf(payment.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
        });

        it('Pay no swap', async () => {
            console.log('Liquidity Minted BST: ' + new BigNumber(await bst.balanceOf(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Payment Minted BST: ' + new BigNumber(await bst.balanceOf(payment.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let amt = web3.utils.toWei('100', 'ether');
            await busd.approve(payment.address, MAX_UNIT256.toFixed(0));
            console.log('BUSD balance: ' + new BigNumber(await busd.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            await payment.pay(busd.address, accounts[1], amt);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            console.log('BUSD balance: ' + new BigNumber(await busd.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[1]\'s BUSD balance: ' + new BigNumber(await busd.balanceOf(accounts[1])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('dev\'s BUSD balance: ' + new BigNumber(await busd.balanceOf('0xB0d88027F5dEd975fF6Df7A62952033D67Df277f')).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let totalQuantity = new BigNumber(await payment.totalQuantity());
            let userInfo = await payment.userInfo(accounts[0]);
            console.log('Quantity: ' + new BigNumber(userInfo[0]).toFixed(0) + ' / ' + totalQuantity.toFixed(0));
            console.log("Payment BST pending: " + new BigNumber(await payment.getUserReward(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
        });

        it('Pay with swap', async () => {
            console.log('Liquidity Minted BST: ' + new BigNumber(await bst.balanceOf(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Payment Minted BST: ' + new BigNumber(await bst.balanceOf(payment.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let amtReceipt = web3.utils.toWei('100', 'ether');
            let amtPay = web3.utils.toWei('105', 'ether');
            await usdc.approve(payment.address, MAX_UNIT256.toFixed(0));
            await usdt.approve(payment.address, MAX_UNIT256.toFixed(0));
            console.log('USDC balance: ' + new BigNumber(await usdc.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('USDT balance: ' + new BigNumber(await usdt.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            await payment.payWithSwap(usdt.address, usdc.address, amtPay, amtReceipt, accounts[2]);
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            console.log('USDC balance: ' + new BigNumber(await usdc.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('USDT balance: ' + new BigNumber(await usdt.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('accounts[2]\'s USDC balance: ' + new BigNumber(await usdc.balanceOf(accounts[1])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('dev\'s USDC balance: ' + new BigNumber(await usdc.balanceOf('0xB0d88027F5dEd975fF6Df7A62952033D67Df277f')).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            let totalQuantity = new BigNumber(await payment.totalQuantity());
            let userInfo = await payment.userInfo(accounts[0]);
            console.log('Quantity: ' + new BigNumber(userInfo[0]).toFixed(0) + ' / ' + totalQuantity.toFixed(0));
            console.log("Payment BST pending: " + new BigNumber(await payment.getUserReward(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
        });
        it('Withdraw BST from payment', async () => {
            console.log('Liquidity Minted BST: ' + new BigNumber(await bst.balanceOf(liquidity.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('Payment Minted BST: ' + new BigNumber(await bst.balanceOf(payment.address)).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            console.log('BST balance: ' + new BigNumber(await bst.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
            await payment.withdrawReward();
            console.log('Block Number: ' + await web3.eth.getBlockNumber());
            console.log('BST balance: ' + new BigNumber(await bst.balanceOf(accounts[0])).div(denominator).toFormat(18, BigNumber.ROUND_DOWN));
        });
    });

});
