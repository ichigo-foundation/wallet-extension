/* main.js */
/* require web3 */
/* require bip39 */
import Unlocked from './classes/Unlocked.js'
import SandboxWallet from './classes/SandboxWallet.js'
import Network from './classes/Network.js'
import { generateQR } from '/lib/qrcode.js'


var app = {
    network: new Network(),
    wallet: new SandboxWallet('_i_walletSandbox'),
    account: new Unlocked()
}

var env = {
    status: 'closed',
    encrypted: ''
}

var currentPage = ''
const nav = (page) => {
    console.log(page)
    if(currentPage.length > 0) $('#'+currentPage).addClass('hide')
    $('#'+page).removeClass('hide')
    currentPage = page
}

const actions = {
        generateSeedPhrase: () => {
            let seed = bip39.generateMnemonic()
            // console.log(' seed generated : '+seed)
            let ht = '<span>'+seed.split(' ').join('</span> <span>')+'</span>'
            console.log(ht)
            $('#_v_seedPhrase').html(ht)
        },

        navNewWallet: () => {
            actions.generateSeedPhrase()
            nav('_p_newWallet')
        },

        navRestoreWallet: () => {
            console.log('nav restore')
            nav('_p_restoreWallet')
        },

        navSettings: () => {
            // get the current contract address
            app.wallet.getContract()
            console.log('nav settings')
            nav('_p_settings')
        },

        navHome: () => {
            nav('_p_home')
        },

        refreshBalance: () => {
            $('#_v_amount').html('...')
            app.wallet.getBalance()
        },


        refreshAccount: () => {
            app.wallet.getAccount()
        },

        createWallet: () => {
            console.log('creating wallet')

            if (! $('#_v_checkConfirm').is(':checked') ){
                $('#_v_checkNotice').addClass('danger')
                return
            }

            nav('_p_setPassword')
        },

        restoreWallet: () => {
            let sp = $('#_v_seedphraseForRestore').val()
            $('#_v_seedPhrase').html(sp)

            nav('_p_setPassword')
        },

        setPassword: () => {
            let pwd1 = $('#_v_password').val()
            let pwd2 = $('#_v_password2').val()

            if(pwd1 != pwd2){
                 $('#_v_errorMessageSetup').html('Passwords do not match !')
                return
            }

            if(pwd1.length < 8){
                $('#_v_errorMessageSetup').html('Password must be at least 8 characters long')
                return
            }

            let sp = $('#_v_seedPhrase').text()
            app.wallet.init(sp)

            // encrypt the mnemonic
            let keys = AES.genKeys()
            let encrypted = AES.cipher(sp, keys, pwd1)

            console.log('ecnrypted mnemonic : ' + encrypted)
            let payload = {keys: keys, encrypted: encrypted}

            // permanent
            chrome.storage.local.set({encrypted: payload}, function() {})
            // destroy on lock
            chrome.storage.local.set({mnemonic: sp}, function() {})

            nav('_p_home')
        },

        lockWallet: () => {
            // Locking account
            chrome.runtime.sendMessage({target:'resolut-background', action: 'lock', payload: ''}, function(res) { })
            // Removing menmonic in storage
            chrome.storage.local.remove('mnemonic', function() { })

            // TODO: unvalidate the wallet

            nav('_p_locked')
        },

        unlockWallet: () => {
            let pass = $('#_v_passwordUnlock').val()
            $('#_v_passwordUnlock').val('')
            console.log(pass)
            var dec
            try{
                dec = AES.decipher(env.encrypted.encrypted, env.encrypted.keys, pass)
            }catch(_){
                console.log(_)
                $('#_v_errorMessageUnlock').html('Password incorrect')
                return
            }

            $('#_v_errorMessageUnlock').html('')

            // Restore the mnemonic not encrypted
            chrome.storage.local.set({mnemonic: dec}, function() {})
            // Unlock the account
            chrome.runtime.sendMessage({target:'resolut-background', action: 'unlock', payload: dec}, function(res) { })
            // Restore the wallet
            app.wallet.init(dec)


            nav('_p_home')
        },

        backLanding: () => {
            nav('_p_landing')
        },

        saveSettings: () => {
            var addr = $('#_v_contractAddr').val()
            app.wallet.setContract(addr)
        }
}


const messageHandlers = {
    init: async (msg) => {
        console.log('init received ! ')
        app.wallet.getBalance()
        app.wallet.getAddress()
    },
    getAddress: async (msg) => {
        console.log('ADDRESS : '+msg)
        $('#_v_accountQrCode').html('')
        generateQR('_v_accountQrCode', msg)
        $('#_v_address').html(msg)
    },
    getBalance: (msg) => {
        $('#_v_amount').html(msg+'.00')
    },
    decrypt: (msg) => {

    },
    getContract: (m) => {
        $('#_v_contractAddr').val(m)
    },
    setContract: () => {
        console.log('The contract address has been set')
    }
}

const hookEvents = function() {
    $('#_f_restoreWallet').on('click', actions.restoreWallet)
    $('#_f_generateSeedPhrase').on('click', actions.generateSeedPhrase)
    $('#_f_createWallet').on('click', actions.createWallet)
    $('#_f_setPassword').on('click', actions.setPassword)
    $('#_f_lockWallet').on('click', actions.lockWallet)
    $('#_f_unlockWallet').on('click', actions.unlockWallet)
    $('#_f_restoreWithSeedPhrase').on('click', actions.restoreWithSeedPhrase)
    $('#_f_refreshBalance').on('click', actions.refreshBalance)
    $('#_f_saveSettings').on('click', actions.saveSettings)

    $('._nav_backLanding').on('click', actions.backLanding)
    $('._nav_newWallet').on('click', actions.navNewWallet)
    $('._nav_restoreWallet').on('click', actions.navRestoreWallet)
    $('._nav_settings').on('click', actions.navSettings)
    $('._nav_home').on('click', actions.navHome)

}

const listenMessage = function () {
    window.addEventListener('message', function(event) {

        let msg = event.data
        if(msg == undefined || msg.target != 'resolut-popup' || msg.action == undefined )
            return true

        console.log(msg)

        if(msg.action in messageHandlers)
            messageHandlers[msg.action](msg.payload)
        return true
    })
}

const findAccountInStorage = function() {
    chrome.storage.local.get(['mnemonic'], function(res1) {
        if(res1.mnemonic == undefined){
            // look for the encrypted key
            chrome.storage.local.get(['encrypted'], function(res2) {
                if(res2.encrypted == undefined){
                    console.log('no encrypted')
                    nav('_p_landing')
                }
                else{
                    console.log('locked')
                    env.status = 'locked'
                    env.encrypted = res2.encrypted
                    console.log(env)
                    nav('_p_locked')
                }

            })
        }else{
            console.log('unlocked')
            console.log(res1.mnemonic)
            app.wallet.init(res1.mnemonic)
            nav('_p_home')
            // nav('_p_settings')
        }
    })
}

const start = function() {
    hookEvents()
    listenMessage()

    if(chrome.storage)
        findAccountInStorage()
    else
        // nav('_p_settings')
        nav('_p_home') // not a chrome extension

    console.log('started')
}

window.onload = start

