/* Account.js */

export default class Account {
    /*** METHODS ***/
    encrypt(msg, encoding = 'base64') {
        var crypt = ''
        var s = eciesLite.encrypt(this.hdkey._publicKey, msg)
        console.log(s)
        crypt += s.ct.toString(encoding) + ':'
        crypt += s.epk.toString(encoding) + ':'
        crypt += s.iv.toString(encoding) + ':'
        crypt += s.mac.toString(encoding)
        return crypt
    }

    decrypt(enc, encoding = '') {
        var s = enc.split(':')
        var crypt = {}
        crypt.ct = util.base64ToBuf(s[0])
        crypt.epk = util.base64ToBuf(s[1])
        crypt.iv = util.base64ToBuf(s[2])
        crypt.mac = util.base64ToBuf(s[3])

        // TODO : fix this by importing node BUFFER inside the browser
        crypt.mac.__proto__.compare =  this.hdkey._publicKey.__proto__.compare

        return eciesLite.decrypt(this.hdkey._privateKey, crypt).toString(encoding)
    }

    sign(msg, encoding = 'base64'){
        return this.hdkey.sign(keccak256(msg)).toString(encoding)
    }

    verify(msg, signature){
        return this.hdkey.verify(keccak256(msg), util.base64ToBuf(signature))
    }


    /*** GETTERS ***/
    address( encoding = 'hex'){
        return '0x'+this._address.toString(encoding)
    }

    publicKey( encoding = 'hex'){
        return this.hdkey._publicKey.toString(encoding)
    }

    privateKey( encoding = 'hex'){
        return this.hdkey._privateKey.toString(encoding)
    }

    identity( encoding = 'hex' ){
        return {
            publicKey: this.publicKey(encoding),
            address: this.address(encoding)
        }
    }
}