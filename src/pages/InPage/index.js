import { SYS, utils } from '../../lib/utils.js';
import { Network } from '../../lib/network.lib.js'

class AccountProvider{

    static methods = [

        /*
        * @param {}
        * @return Promise<{status:string, address:string>}
        */
        'getConfig',

        /*
        * @param {}
        * @return Promise<{status:string, address:string>}
        */
        'getAccountStatus',

        /*
        * @param {}
        * @return Promise<{balance:bn}> ichigo balance
        */
        'getAccountBalance',

        /*
        * @param {}
        * @return
        */
        'getContacts',

        /*
        * @param {message: string}
        * @return Promise<{body:string}>
        */
        'encrypt',

        /*
        * @param {body: string}
        * @return Promise<{message:string}>
        */
        'decrypt',

        /*
        * @param {message: string}
        * @return Promise<{encrypted:string}>
        */
        'cipher',

        /*
        * @param {encrypted: string}
        * @return Promise<{message:string}>
        */
        'decipher',

        /*
        * @param {message: string}
        * @return Promise<{signature:string}>
        */
        'sign',

        /*
        * @param {message: string, signature:string}
        * @return Promise<{valid:boolean}>
        */
        'verify',

        /*
        * @param {message: string, signature:string}
        * @return Promise<{valid:boolean}>
        */
        'addContact',

        /*
        * @param {message: string, signature:string}
        * @return Promise<{valid:boolean}>
        */
        'signKagi',

    ]

    constructor(){
        AccountProvider.methods.forEach((method) => {
            this[method] = function(payload) { return this._send(method, payload) }
        })
    }

    version(){
        console.log('ichigo account provider v0.1.72')
    }

    _send(action, payload){
        var id = 'msg_'+(Math.random()).toString().slice(2)
        var msg = {
            target:SYS.TARGET.CONTENT,
            action:action,
            payload:payload||{},
            id: id
        }

        console.log('[PAGE -> BACK]', action, payload)
        return new Promise( (resolve, reject) => {
            let hdl = (e) => {
                if(e.data != undefined && e.data.target == SYS.TARGET.PAGE){
                    if(e.data.id ===id){
                        window.removeEventListener('message', hdl)
                        console.log('[BACK -> PAGE]', action, e.data.payload.payload)
                        resolve(e.data.payload)
                    }
                }
            }
            window.addEventListener('message', hdl)
            window.postMessage(msg, '*')
        })
    }

}

class AdminProvider{

    constructor(){

    }

    getKagiNumber(filter){

    }

    getKagis(filter){
        filter = filter || {}
        return Network.getKagi(filter)
    }

    getContracts(filter){
        filter = filter || {}
        return Network.getContract(filter)
    }

    /**
    * unpin the document, delete the contract, delete all kagis, (TODO: post in archive)
    */
    collect(docID){
        return Network.collect(docID)
    }

}

class Utils{
    constructor(){
        this.convert = {
            b64: {
                b58: (str) => bs58.encode(Buffer.from(str, 'base64')),
                hex: (str) => Buffer.from(str, 'base64').toString('hex'),
                str: (str) => Buffer.from(str, 'base64').toString('utf-8')
            },
            b58: {
                b64: (str) => bs58.decode(str).toString('base64'),
                hex: (str) => bs58.decode(str).toString('hex')
            },
            buf:{
                b64: (buf) => buf.toString('base64'),
                b58: (buf) => bs58.encode(buf)
            },
            string:{
                blob: (s) => b64toBlob(btoa(s))
            }
        }
    }

    cipher(str){
        return Network.cipher(str)
    }

    decipher(content, keys){
        return Network.decipher(content, keys)
    }
}

window.ichigo = {
    account: new AccountProvider(),
    admin: new AdminProvider(),
    utils: new Utils()
}

