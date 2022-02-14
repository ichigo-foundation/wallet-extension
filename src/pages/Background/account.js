
const ACCOUNT_STATUS = {
    empty: 'empty',
    unknown: 'unknown',
    uninitialized: 'uninitialized',
    locked: 'locked',
    unlocked: 'unlocked',
    pending: 'pending'
}

const version = '0.1'
const env = 'DEV'

const DERIVE_PATH_ED = "m/44'/501'/0'"
const DERIVE_PATH_KECCAK = "m/44'/60'/1'/0/0"

var SOLANA_URL = {
    DEV: 'https://api.devnet.solana.com'
}

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
const ASSOCIATED_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'

// TODO :get configuration from conf file

const _getAssociatedTokenAddress = (publicKey, mint) => {
    var mintAddress = new solanaWeb3.PublicKey(mint)
    var TOK_PROG = new solanaWeb3.PublicKey(TOKEN_PROGRAM_ID)
    var ASSOC_TOK = new solanaWeb3.PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID)
    return solanaWeb3.PublicKey.findProgramAddress([publicKey.toBuffer(), TOK_PROG.toBuffer(), mintAddress.toBuffer()], ASSOC_TOK)
}

const _getRecentBlockhash = async () =>{
    // prepare RPC call
    var input = SOLANA_URL[env]
    var _id = 'rpc_'+Math.random()*10**17

    return new Promise((resolve, reject) => {
        fetch(input, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: _id,
                jsonrpc: '2.0',
                method: 'getRecentBlockhash'
            })
        })
        .then(response => response.json())
        .then(body => resolve(body.result?.value?.blockhash))
    })
}

const _getIchigoNetworkConfig = () => {
    return new Promise((resolve, reject) => {
        fetch('https://ichigo-market.storage.googleapis.com/vars/config.json')
        .then(response => response.json())
        .then(body => {
            chrome.storage.local.set({config: body})
            resolve(body)
        })
    })
}

class Account {

    constructor(){
        this.status = ACCOUNT_STATUS.empty
    }

    async create(sp){
        // console.log('[BACK] creating account with', sp) // DANGER do not uncomment unless troubleshooting

        if(sp.length < 55)
            throw 'unvalid seedphrase'

        // seed
        let seed = await cryptolib.bip39.mnemonicToSeed(sp)

        // wallet
        const { key } = cryptolib.ed25519.derivePath(DERIVE_PATH_ED, seed.toString('hex'))
        let keypair = solanaWeb3.Keypair.fromSeed(key)
        this.wallet = new solanaWeb3.Account(keypair.secretKey)
        this.wallet.main = this.wallet.publicKey
        this.wallet.ichigo = (await _getAssociatedTokenAddress(this.wallet.publicKey, this.config[version][env].MINT))[0]

        // profile
        let origin = cryptolib.hdkey.fromMasterSeed(seed)
        this.profile = origin.derive(DERIVE_PATH_KECCAK)
        this.profile.address = bufferToAddress(this.profile.publicKey)

        this.address = this.profile.address.replace(/(.{12})/g,"$1-")+'-'+this.wallet.main.toString().replace(/(.{12})/g,"$1-") // ichigo<pubkey> + solana<pubkey>
        // this.address = bufferToAddress(this.profile.publicKey) + this.wallet.publicKey.toString() // ichigo<pubkey> + solana<pubkey>
        this.seedphrase = sp
        this.status = ACCOUNT_STATUS.unlocked
    }

    save(){
        // save the clear seedphrase, for unauthorized retrieval
        // console.log('SAVING SEEDPHRASE', this.seedphrase.length,'->', this.seedphrase)
        return new Promise( (resolve, reject) => chrome.storage.local.set({mnemonic: this.seedphrase}, resolve))
    }

    store(pwd){
        // store premanantly the seedphrase, call only when changing password
        let keys = AES.genKeys()
        let encrypted = AES.cipher(this.seedphrase, keys, pwd)
        let secret = {keys: keys, encrypted: encrypted}

        return new Promise( (resolve, reject) => chrome.storage.local.set({secret: secret}, resolve))
    }

    load(){
        if(this.status != ACCOUNT_STATUS.empty)
            return

        // get the config file
        return new Promise( (resolve, reject) => {
            chrome.storage.local.get(['mnemonic', 'secret', 'config'], async (stored) => {
                this.config = stored.config || await _getIchigoNetworkConfig()
                if(stored.mnemonic){
                    await this.create(stored.mnemonic)
                    resolve()
                }
                else {
                    this.status = stored.secret ? ACCOUNT_STATUS.locked : ACCOUNT_STATUS.uninitialized
                    resolve()
                }
            })
        })
    }

    async getConfig(force){
        if(!this.config || force){
            this.config = await _getIchigoNetworkConfig()
        }
        return this.config
    }

    lock(){
        this.solana = undefined
        this.publicKey = undefined
        this.profile = undefined
        this.seedphrase = undefined
        this.status = ACCOUNT_STATUS.locked

        return new Promise ((resolve, reject) => {
            chrome.storage.local.remove('mnemonic', resolve)
        })
    }

    unlock(pwd){
        return new Promise( (resolve, reject) => {
            var sp
            chrome.storage.local.get(['secret'], async (res) => {
                if(res == undefined){
                    reject() // Trouble here, should never come here
                    return
                }
                try{
                    sp = AES.decipher(res.secret.encrypted, res.secret.keys, pwd)
                }catch(_){
                    resolve() // wrong password
                    return
                }
                await this.create(sp)
                await this.save()
                resolve()
            })
        })
    }

    async balance(){
        // prepare RPC call
        var input = this.config[version][env].SOLANA
        var _id = 'rpc_'+Math.random()*10**17
        return new Promise((resolve, reject) => fetch(input, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                    id: _id,
                    jsonrpc: '2.0',
                    method: 'getTokenAccountBalance',
                    params: [this.wallet.ichigo.toBase58()]
                })
          })
           .then( response => response.json())
           .then( body => resolve((body.result?.value?.uiAmountString) ? body.result.value.uiAmountString : '0.00') )
           .catch( err => resolve('----') )
        )
        // var body = await response.json()
        // var bal = (body.result?.value?.uiAmountString) ? body.result.value.uiAmountString : '0.00'
        // return bal
    }

    encrypt(msg, encoding = 'base64') {
        var crypt = ''
        var s = cryptolib.ecies.encrypt(this.profile.publicKey, cryptolib.Buffer.from(msg))
        crypt += s.ct.toString(encoding) + ':'
        crypt += s.epk.toString(encoding) + ':'
        crypt += s.iv.toString(encoding) + ':'
        crypt += s.mac.toString(encoding)
        return crypt
    }

    decrypt(enc, encoding = 'utf8') {
        var s = enc.split(':')
        var crypt = {}
        crypt.ct = base64ToBuf(s[0])
        crypt.epk = base64ToBuf(s[1])
        crypt.iv = base64ToBuf(s[2])
        crypt.mac = base64ToBuf(s[3])

        // TODO : FIX THIS
        crypt.mac.__proto__.compare =  this.profile._publicKey.__proto__.compare

        return cryptolib.ecies.decrypt(this.profile._privateKey, crypt)
    }

    async transferInstruction(cost, node){

        var amount = cost * 10**9 // 10**9 is decimal amount
        var node_pk = new solanaWeb3.PublicKey(node)
        var node_ichigo_pk = (await _getAssociatedTokenAddress(node_pk, this.config[version][env].MINT))[0]

        var ix = SPL.lib.Token.createTransferInstruction(
          SPL.lib.TOKEN_PROGRAM_ID,
          this.wallet.ichigo,
          node_ichigo_pk,
          this.wallet.main,
          [],
          amount
        )
        var tx = new solanaWeb3.Transaction()
        tx.add(ix)
        tx.recentBlockhash =  await _getRecentBlockhash()
        tx.feePayer = node_pk

        tx.partialSign(this.wallet)

        var tx_msg = tx.serializeMessage()
        var {signature:tx_sign} = tx.signatures.filter( k => k.publicKey.toBase58() === this.wallet.main.toBase58() )[0]

        var wire = {
            message: tx_msg.toString('base64'),
            signature: tx_sign.toString('base64')
        }

        return Promise.resolve( JSON.stringify(wire) )
    }

    sign(msg, encoding = 'base64'){
        return this.profile.sign(cryptolib.keccak256(msg)).toString(encoding)
    }

    verify(msg, signature){
        return this.profile.verify(cryptolib.keccak256(msg), base64ToBuf(signature))
    }

    addContact(name, address){
        return new Promise( (resolve, reject) => {
            chrome.storage.local.get(['contacts'], async (res) => {
                var tmp = res.contacts || {}
                tmp[address] = {name:name, address:address}
                chrome.storage.local.set({contacts: tmp}, ()=> resolve(true))
            })
        })
    }

    getContacts(){
        return new Promise( (resolve, reject) => {
            chrome.storage.local.get(['contacts'], async (res) => {
                resolve(res ? res : {contacts:{}})
            })
        })
    }

    removeContact(address){
        return new Promise( (resolve, reject) => {
            chrome.storage.local.get(['contacts'], async (res) => {
                var tmp = res.contacts || {}
                delete tmp[address]
                chrome.storage.local.set({contacts: tmp}, ()=> resolve(true))
            })
        })
    }

    signKagi(msg){
        // TODO : check that the msg is a kagi signature
        return this.profile.sign(cryptolib.keccak256(msg)).toString('base64')
    }

}
