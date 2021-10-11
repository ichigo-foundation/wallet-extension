import Account from './Account.js'

export default class Unlocked extends Account{

    constructor(){
        super()
        this.friendships = []
        this.documents = []
    }

    async init(hdkey){
        this.hdkey = hdkey
        this._address = keccak256(hdkey._publicKey.toString('hex')).slice(-20)
    }

    async fetchAccount() {
        let payload =  {
            address: this.address('hex')
        }
        let acc = await app.network.transmit('get', 'account', payload)

        if(acc.result.length == 0)
            return false

        this.friendships = acc.result[0].friendships.map( f => new Locked(f) )
        this.manifest = acc.result[0].manifest
        return true
    }

    async fetchDocuments() {
        let payload =  {
            address: this.address('hex'),
            manifest: this.manifest.docs
        }

        let docs = await app.network.transmit('get', 'documents', payload)
        this.documents = docs.result
    }

    async getDocument(docID) {
         let payload =  {
            address: this.address('hex'),
            manifest: this.manifest.docs,
            documentID: docID
        }

        return await app.network.transmit('get', 'document', payload)
    }

    /*** PUBLIC ***/
    setAlias(alias) {
        let payload =  {
            alias: alias
        }
        return app.network.transmit('post', 'alias', payload)
    }

    getAlias(alias) {
        let payload = {
           alias: alias
        }
        return app.network.transmit('get','alias', payload)
    }

    setAccount(profile = { DisplayName: 'dn', OtherInfo:' blablabla' }) {
        let payload =  {
            address: this.address(),
            profile: profile,
            publicKey: this.publicKey()
        }
        return app.network.transmit('post', 'account', payload)
    }


    addFriend(newFriend) {
        // this.friendships.push(friend)
        let fs = this.friendships.map( f => f.address() )
        fs.push(newFriend)
        let payload = {
            friendships : fs
        }
        return app.network.transmit('put', 'account', payload)
    }

    removeFriend(friend) {
        // TODO
        // this.friendships.remove(friend)
        // let payload = {
        //     friendships : this.friendships
        // }
        // return app.network.transmit('put', 'account', payload)
    }

    addDocument(headers) {
        let payload = {
            headers: headers,
            manifest: this.manifest.docs
        }

        return app.network.transmit('post', 'document', payload)

    }

    addFile(docID, headers, content) {
        let payload = {
            headers: headers,
            manifest: this.manifest.docs,
            documentID: docID
        }

        return app.network.upload(payload, content)
    }

    addGrant(docID, grantee, permission, key) {
        // TODO : add grant for someone else

        let payload = {
            manifest: this.manifest.grants,
            documentID: docID,
            grantee: grantee,
            permission: permission,
            key: key
        }

        return app.network.transmit('post', 'grant', payload)

    }

    revokeGrant(docID, grantee) {
        let payload = {
            docID: docID,
            grantee: grantee
        }
    }

}
