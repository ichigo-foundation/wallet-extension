/* main.js */

import Wallet from './wallet.js'

var wallet = new Wallet()

const actions = {
    init: async (msg) => {
      let seed = await bip39.mnemonicToSeed(msg)
      let origin = hdkey.fromMasterSeed(seed)
      wallet.init(origin.derive("m/44'/60'/0'/0/0"))
      window.parent.postMessage({target:'resolut-popup', action: 'init', payload: ''},'*')
    },
    getAddress: async (msg) => {
      let address = wallet.address()
      window.parent.postMessage({target:'resolut-popup', action: 'getAddress', payload: address},'*')
    },
    getBalance: async (msg) => {
      let balance = await wallet.getBalance()
      window.parent.postMessage({target:'resolut-popup', action: 'getBalance', payload: balance},'*')
    },
    getContract: async (msg) => {
      let contract = wallet.getContract()
      window.parent.postMessage({target:'resolut-popup', action: 'getContract', payload: contract},'*')
    },
    setContract: async (msg) => {
      wallet.setContract(msg)
      window.parent.postMessage({target:'resolut-popup', action: 'setContract', payload: msg},'*')
    }
}

export const start = () => {
  window.addEventListener('message', function(event) {
    let msg = event.data

    if(msg == undefined || msg.target != 'resolut-sandbox' || msg.action == undefined )
      return true

    if(msg.action in actions)
      actions[msg.action](msg.payload)

    return true
  })
}
