// /* background.js */

// importScripts('./background/background.js')
importScripts('/lib/bip39.bundle.js')
importScripts('/lib/ecies.bundle.js')
importScripts('/lib/keccak256.bundle.js')
importScripts('/lib/hdkey.bundle.js')
importScripts('/lib/util.js')
importScripts('/account/codec.js')
// importScripts('./lib/aes.js')

var loaded = false
var codec = new Codec()

// Retrieve the account from storage
const init = async (msg) => {
    let seed = await bip39.mnemonicToSeed(msg)
    let origin = hdkey.fromMasterSeed(seed)
    let branch = origin.derive("m/44'/60'/1'/0/0")
    codec.init(branch)
}

const loadAccounts = () => {
    chrome.storage.local.get(['mnemonic'], function(res1) {
        if(res1.mnemonic == undefined){
            // look for the encrypted key
            chrome.storage.local.get(['encrypted'], function(res2) {
                if(res2.encrypted == undefined){
                    console.log('[BACK] nothing found in storage')
                    codec.status = 'closed'
                }
                else{
                    console.log('[BACK] encrypted found in storage')
                    codec.status = 'locked'
                }
            })
        }else{
            console.log('[BACK] mnemonic found in storage')
            init(res1.mnemonic)
        }
        loaded = true

    })
}

loadAccounts()

// List of handlers by action
const actions = {
    status: (msg, callback) =>{
        callback(codec.status)
        console.log('⮩', codec.status)
        return true
    },
    lock: () => {
        codec = new Codec() // destroying the codec
        codec.status = 'locked'
        return true
    },
    unlock: (msg, callback) => {
        init(msg)
        codec.status = 'unlocked'
        callback(true)
        console.log('⮩', true)
        return true
    },
    accountAddress: async (msg, callback) => {
        let result = codec.address()
        callback(result)
        console.log('⮩', result)
        return true
    },
    accountPublicKey: async (msg, callback) => {
        let result = codec.publicKey()
        callback(result)
        console.log('⮩', result)
        return true
    },
    encrypt: (msg, callback) => {
        let result = codec.encrypt(msg)
        callback(result)
        console.log('⮩', result)
        return true
    },
    decrypt: (msg, callback) => {
        let result = codec.decrypt(msg)
        callback(result)
        console.log('⮩', result)
        return true
    },
    wrap: (msg, callback) => {
        let hash = codec.publicKey('base64') + msg.payload
        let result = {
            meta: msg.meta,
            payload: msg.payload,
            identity: {
                publicKey: codec.publicKey('base64'),
                signature: codec.sign(hash, 'base64')
            }
        }
        callback(result)
        console.log('⮩', result)
        return true
    },
    verify: (msg, callback) => {
        let result = codec.verify(msg.payload, signature)
    }
}

var waitForWallet = async () => {
    var i = 0
    while(codec.status == "starting" || i++ == 10){ // wait for the wallet to be done starting
        await new Promise(resolve => setTimeout(resolve, 250))
    }
}

chrome.runtime.onMessage.addListener( (msg, sender, callback) => {
    if(msg.target != 'resolut-background')
            return

    console.log('[RCV] ', msg.action,' -> ', msg)

    waitForWallet().then( () => {
        if(codec.status != 'unlocked' && !['unlock', 'status', 'init'].includes(msg.action)){
            // try to open the wallet
            console.log('wallet cannot be accessed (not unlocked)')
            callback('0')
            return true
        }

        if(msg.action in actions)
            actions[msg.action](msg.payload, callback)
    })

    return true
})
