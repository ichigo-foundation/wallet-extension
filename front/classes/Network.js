/* Network.js */

export default class Network{

    constructor() {
        this.messageVersion = 'P01'
        this.format = 'ECDSA:KEC:B64:A-CBR'
    }

    init(addr){
        this.nodeUrl = addr
    }

    async putDoc() {
        // Upload the doc 
        // Get the 
    }

    async setAccount() {

    }

    async getAccount() {

    }

    async addGrant(grantee, docId, permission, key) {
        //format message
        let meta = this.messageVersion + '/' + this.format + endpoint
        let payload =  JSON.stringify({
            grantor:grantor,
            grantee:grantee,
            docID:docID,
            permission:permission,
            key:key
        })
        let message = await transmit.wrap(meta, payload)
        console.log(message)
        // transmit.httpPost('/db', message)
        $.post( nodeUrl + '/db', message )

    }

    wrap(meta, payload) {
        let hash = app.spring.me.publicKey('base64') + payload
        return {
            meta: meta,
            payload: payload,
            identity: {
                publicKey: app.spring.me.publicKey('base64'),
                signature: app.spring.me.sign(hash, 'base64')
            }
        }
    }

    transmit(method, endpoint, payload, callback) {
        let meta = this.messageVersion + '/' + this.format + '/' + endpoint
        let msg = this.wrap(meta, payload)
        console.log(msg)
        return new Promise( (res, rej) => {
            $.ajax({
                url: this.nodeUrl+'/db',
                type: method,
                data: msg,
                success: res,
                error: rej
            });
        })
    }

    upload (payload, content) {
        var formdata = new FormData()
        formdata.append('file', new Blob([content], { type: 'text/plain'}))

        let meta = this.messageVersion + '/' + this.format + '/file'
        let msg = this.wrap(meta, payload)
        formdata.append('msg', JSON.stringify(msg))

        console.log(msg)

        return new Promise ( (res,rej) => {
            var request = new XMLHttpRequest()
            request.onload = res
            // request.data = msg
            request.open('POST', this.nodeUrl+'/upload')
            request.send(formdata)
        })
    }

    async getAccount(addr){
        let payload =  {
            address: addr
        }
        return await app.network.transmit('get', 'account', payload)
    }


    bigBang() {
        return new Promise( (res, rej) => {
            $.ajax({
                url: this.nodeUrl+'/bigbang',
                type: 'GET',
                success: res,
                error: rej
            });
        })
    }
    // httpUpload(endpoint, content)  {
    //     let formdata = new FormData()
    //     formdata.append('message', new Blob([content], { type: 'text/plain' }))

    //     var request = new XMLHttpRequest()
    //     request.onload = (result) {
    //         console.log('Message transmitted')
    //     }
    //     request.open('POST', nodeUrl + endpoint)
    //     request.send(formdata)
    // }

    // httpPost(endpoint, content){
        

    //     // let formdata = new FormData()
    //     // formdata.append('message', new Blob([content], { type: 'text/plain' }))

    //     // $.ajax({
    //     //   type: "POST",
    //     //   url: nodeUrl + endpoint,
    //     //   data: content,
    //     //   success: () => {},
    //     //   dataType: 'text/plain'
    //     // });


    //     // $.post( "ajax/test.html", function( data ) {
    //     //   $( ".result" ).html( data );
    //     // });

    //     // var request = new XMLHttpRequest()
    //     // request.onload = (result) => {
    //     //     console.log('Message transmitted')
    //     // }
    //     // request.open('POST', nodeUrl + endpoint)
    //     // request.send(formdata)

    // }
}