import { SYS, utils } from '../../lib/utils.js';
import { Network } from './network.lib.js'


const IPFS_GATEWAYS = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://gateway.ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/'
]

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
        console.log('ichigo account provider v0.021')
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

class NetworkProvider{
    constructor(){
    }

    /**
    *
    * @params {data} string
    * @params {period} persistency in days (number)
    * @params {readerPKS_tmp} array of ichigo account address
    *
    * @return Promise<{error, payload:{
    *   audience
    *   ipfsHash
    *   keyCount
    *   size
    *   timestamp
    * }}>
    *
    */
    async share(data, period, readerPKs_tmp){

        console.log('sharing', data)

         if(readerPKs_tmp[0] == '$'){
            // make a public post

            // 1 - encrypt the data
            var {keys, encrypted} = Network.cipher(data)

            // console.log(keys)
            // console.log(encrypted)
            // var readerKeys = { $:readerKeys[reader.toString('base64')] = Network.encrypt(keys, reader)
            // return Promise.resolve({error:587})

            // 2 - store the data
            return new Promise((resolve, reject) => {
                Network.store(encrypted, period, 1).then(
                    ({error, payload}) => {
                        if( error == 0 )
                            Network.setKagi('$', payload.IpfsHash, keys)
                            .then( r => resolve({
                                error:0,
                                payload:{
                                    ipfsHash: payload.IpfsHash,
                                    size: payload.PinSize,
                                    timestamp: payload.Timestamp,
                                    audience: 'public',
                                    keyCount: 1
                                }
                            }))
                            .catch( e => resolve({error:e}) )
                        else{
                            resolve({error:error})
                        }
                    })
            })

        }

        // 0- add my own key to the reader keys
        var {payload} = await ichigo.account.getAccountStatus()
        if(!payload.address) return // wallet locked ?
        readerPKs_tmp.push(payload.address)

        // 1- modify ichigo address to profile address
        var readerPKs = readerPKs_tmp.map( k => utils.accountToProfilePubK(k) )

        // 2- encrypt the data
        var {keys, encrypted} = Network.cipher(data)

        // 3- encrypt keys for each reader
        var readerKeys = {}
        readerPKs.forEach( reader => {
            readerKeys[reader.toString('base64')] = Network.encrypt(keys, reader)
        })

        // 4- store the data
        return new Promise((resolve, reject) => {
            Network.store(encrypted, period, readerPKs.length).then(
                ({error, payload}) => {
                    if( error == 0 )
                        Network.setManyKagi(payload.IpfsHash, readerKeys)
                        .then( r => resolve({
                            error:0,
                            payload:{
                                ipfsHash: payload.IpfsHash,
                                size: payload.PinSize,
                                timestamp: payload.Timestamp,
                                audience: 'private',
                                keyCount: readerPKs.length
                            }
                        }))
                        .catch( e => resolve({error:e}) )
                    else{
                        resolve({error:error})
                    }
                })
        })
    }

    /** get kagi
    * @params REQ {public} boolean
    * @params REQ {audience} onwerpubkey/$/@
    * SIGNED
    */
    async getPosts(preference, params){
        preference = preference || 'all'

        var {error:address_error, payload:{status, address}} = await ichigo.account.getAccountStatus()

        if(address_error != 0 || status != 'unlocked'){
            // cannot continue
            return {error: -1}
        }

        var promises = []
        var audience_addr = utils.accountToProfilePubK(address)

        // All contacts (contact param not specified)
        if(['contacts'].includes(preference) && params.length === 0){
            let {payload} = await ichigo.account.getContacts()
            let contacts = Object.keys(payload.contacts||{})

            if(payload.contacts && contacts.length > 0){
                promises = contacts.map( c => Network.getKagi({$or:[{audience:'$'}, {audience:audience_addr}], owner: c}) )
            }
        }

        // Specified
        if(['contacts'].includes(preference) && params.length > 0){
            let contacts = params || []
            promises = contacts.map( c => Network.getKagi({$or:[{audience:'$'}, {audience:audience_addr}], owner: c}) )
        }

        // Public + Contacts
        if(['all'].includes(preference)){
            promises.push( Network.getKagi({$or:[{audience:'$'}, {audience:audience_addr}], owner: {$ne:address} }) )
        }

        // My posts
        if(['mine'].includes(preference)){
            promises.push( Network.getKagi({owner: address, $or:[{audience:'$'}, {audience:audience_addr}]}) )
        }

        // Address
        if(['address'].includes(preference)){
            promises.push( Network.getKagi({owner: params, $or:[{audience:'$'}, {audience:audience_addr}]}) )
        }


        //
        var results = await Promise.all(promises)

        return Promise.resolve({
            error: results.reduce((a,b) => a + b.error, 0),
            payload: results.map( c => c.payload).flat()
        })
    }

    async getData({audience, docID, key}){

        try{
            // let response = await fetch(IPFS_GATEWAYS[0]+docID)
            let response = await fetch('https://ichigo.mypinata.cloud/ipfs/'+docID)
            let {_0:data} = await response.json()

            // decrypt the key
            if(audience != '$'){
                var {error, payload:{message}} = await ichigo.account.decrypt({body: key})
                key = message
                if(error != 0) throw 'cannot decrypt key'
            }
            // decipher data
            var post_string = Network.decipher(data, key)
            var post = JSON.parse(post_string)

        }catch(_){
            return Promise.resolve({error:-1, comment:_})
        }

        return Promise.resolve({error:0, post:post})
        // console.log(docID, json._0)
    }

    convert(){
        return Network.convert
    }

    version(){
        console.log('ichigo network provider v0.015')
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
    network: new NetworkProvider(),
    admin: new AdminProvider(),
    utils: new Utils()
}


// IN PAGE TESTING
const test = {

    // test when the wallet is initialized
    empty: async () => {
        let a = await ichigo.getAccountStatus()
        let b = await ichigo.getAccountBalance()
        let c = await ichigo.encrypt({message:'Hello world'})
        // let d = await ichigo.decrypt()
        console.log('[account status] ', a.payload)
        console.log('[balance] ', b.payload)
        console.log('[encrypt] ', c.payload)
    },

    unlocked: async () => {
        let a = await ichigo.getAccountStatus()
        let b = await ichigo.getAccountBalance()
        let c = await ichigo.encrypt({message:'Hello world'})
        let d = await ichigo.decrypt({body: c.payload.body })
        let e = await ichigo.sign({message:'my message'})
        let f_1 = await ichigo.verify({message:'my message', signature: e.payload.signature})
        let f_2 = await ichigo.verify({message:'my message 2', signature: e.payload.signature})

        console.log('[account status] ', a.payload)
        console.log('[balance] ', b.payload)
        console.log('[encrypt] ', c.payload)
        console.log('[decrypt] ', d.payload)
        console.log('[sign] ', e.payload)
        console.log('[verify OK] ', f_1.payload)
        console.log('[verify NOT] ', f_2.payload)
    }
}

// window._test_ichigo = test