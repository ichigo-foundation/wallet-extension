// Sandbox.js

export default class SandboxWallet {

    constructor(id){
        this.iframe = document.getElementById(id)
    }

    init(mn){
        this.send('init', mn)
    }

    getAddress() {
        this.send('getAddress','')
    }

    getBalance(){
        this.send('getBalance','')
    }

    getContract() {
        this.send('getContract','')
    }

    setContract(addr) {
        this.send('setContract', addr)
    }

    transfer(to, amount){

    }

    lock(){
        this.send('lock','')
    }

    unlock(){
        this.send('unlock','')
    }

    send(action, msg){
        this.iframe.contentWindow.postMessage({target:'resolut-sandbox', action: action, payload: msg},'*')
    }

}