
importScripts(
    'account.js',
    'cryptolib.bundle.js',
    'aes.js',
    'solana.web3.js',
    'spl.bundle.js',
    'helpers.js',
    'processor.js',
    'prompt.js'
)

var account = new Account()
var processor = new Processor(account)

async function handleMessage (msg, sender, pageCallback) {

    const callback = (ret) => { ret.id = msg.id; pageCallback(ret)}

    // startup the account
    await account.load()

    // verify validity of request
    if( !(msg && msg.action && Processor.methods().includes(msg.action) ) ){
        callback({error:121, payload:{msg:'unvalid request'}})
        return
    }

    // public sender -> must check access authorization (except for getAccountSatus which is always accessible)
    if(!sender.url.includes('chrome-extension') && msg.action != 'getAccountStatus'){

        // wallet is not prepared to be used
        if( [ACCOUNT_STATUS.empty, ACCOUNT_STATUS.uninitialized, ACCOUNT_STATUS.unknown ].includes(account.status) ){
            callback({error:122, payload:{msg:'wallet unaccessible'}})
            return
        }

        // wallet is lock -> show unlock pop-up
        if(account.status == ACCOUNT_STATUS.locked){
            await prompt(account)
            if(account.status == ACCOUNT_STATUS.locked ){
                callback({error:150, msg:'wallet is locked'})
                return
            }
        }

        // calling authorized method
        if(!processor.publicMethods.includes(msg.action)) {
            callback({error:123, payload:{msg:'unauthorized action'}})
            return
        }

        // calling confirmation required methods (only sign atm)
        if(msg.action == 'sign') {
            // parse the message to be signed
            var instruction = msg.payload.message.split('{')[0]
            var content = JSON.parse(msg.payload.message.slice(instruction.length))

            const authorized_transcation = [
                'store',
                'getContract',
                'collect'
            ]

            if(!authorized_transcation.includes(instruction)){
                callback({error:151, payload:{msg:'transaction unknown'}})
                return
            }

            processor.vars.transaction = {
                instruction:instruction,
                msg: content,
                keyCount: msg.payload.keyCount
            }

            account.status = ACCOUNT_STATUS.pending
            await prompt(account)
            processor.vars.transaction = undefined
            if(account.status == ACCOUNT_STATUS.pending){
                account.status = ACCOUNT_STATUS.unlocked
                callback({error:151, payload:{msg:'transaction was rejected'}})
                return
            }
        }

        if(msg.action == 'addContact'){

            processor.vars.transaction = {
                instruction:msg.action,
                msg: msg.payload
            }

            account.status = ACCOUNT_STATUS.pending
            await prompt(account)
            processor.vars.transaction = undefined
            if(account.status == ACCOUNT_STATUS.pending){
                account.status = ACCOUNT_STATUS.unlocked
                callback({error:151, payload:{msg:'transaction was rejected'}})
                return
            }
        }

    }

    // the caller is extension itself or authorized public caller -> can execute
    var res = await processor[msg.action](msg.payload)
    var ret = (res && res.error && res.error == -10) ?
                {error:201, payload:{msg: '['+msg.action+'] was missing parameter >'+msg.payload}} :
                {error:0, payload:res}
    callback(ret)
}

chrome.runtime.onMessage.addListener( (msg, sender, callback) => {
    _( (isFromPopup(sender.url)?'POPUP':'PAGE') + ' -> BACK', {action:msg.action,payload:msg.payload, id:msg.id})

    handleMessage(msg, sender, (ret) => {
        _('BACK -> '+ (isFromPopup(sender.url)?'POPUP':'PAGE'), ret.payload)
        callback(ret)
    })
    return true
})

// test()
