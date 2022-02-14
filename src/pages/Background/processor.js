
class Processor  {

    constructor(account){
      this.publicMethods = [
          'getConfig',
          'getAccountStatus',
          'encrypt',
          'decrypt',
          'verify',
          'getContacts',
          'sign', // confirmation required
          'addContact', // confirmation required
          'signKagi', // to review because this is signing
      ]
      this.account = account
      this.vars = {}
    }

    static methods() {
        return Object.getOwnPropertyNames(Processor.prototype)
    }

    setSeedphrase ({seedphrase}) {
        this.vars.seedphrase = seedphrase
    }

    getCurrentTransaction () {
        return {transaction: this.vars.transaction }
    }

    confirmTransaction () {
        this.account.status = ACCOUNT_STATUS.unlocked
        return { }
    }

    async createAccount  ({password}) {
        await this.account.create(this.vars.seedphrase)
        await this.account.save()
        await this.account.store(password)
        this.vars.seedphrase = ''

        return {address: this.account.address}
        // return 's'
    }

    async getAccountStatus  () {
        if(this.account.status == ACCOUNT_STATUS.empty){
            await this.account.load()
        }
        return {status: this.account.status, address: this.account.address}
    }

    async getAccountBalance() {
        var res = await this.account.balance()
        return {balance: res}
    }


    async lockAccount  () {
        await this.account.lock()
        return {status: this.account.status}
    }

    async unlockAccount  ({password}) {
        if(!password) return {error:-10}
        await this.account.unlock(password)
        return {status: this.account.status}
    }

    async encrypt ({message}) {
        if(!message) return {error:-10}
        return {body: this.account.encrypt(message)}
    }

    async decrypt ({body}) {
        if(!body) return {error:-10}
        return {message: this.account.decrypt(body).toString('utf-8')}
    }

    async sign ({message, node}) {

        // TODO : retrieve  from here !!!

        try {
            if(!message) throw ''
            var instruction = message.split('{')[0]
            var content = JSON.parse(message.slice(instruction.length))
        }catch(_){
            console.log(_)
            return {error:-10}
        }

        var sign_string =  {signature: this.account.sign(message),
                address: this.account.address,
                publicKey: this.account.profile.publicKey.toString('base64')}

        if(instruction === 'store'){
            const cost = content.cost || 1
            const TMP_node = '6T7FeyrHfAneVuYxY3V8aCcjuQadsctniX4Vpvgs3JLk' // TODO : change this with a get node, from the inPage !!!!
            // check there is enough in the balance
            const bal = await this.account.balance()
            if(bal < cost){
                // Panic ! should not come here
                return Promise.resolve({error: 999})
            }
            sign_string.wire = await this.account.transferInstruction(cost, node || TMP_node)
        }

        return Promise.resolve( sign_string )
    }

    async signKagi ({message}) {
        if(!message) return {error:-10}
        return {signature: this.account.signKagi(message),
                address: this.account.address,
                publicKey: this.account.profile.publicKey.toString('base64')}
    }

    async verify ({message, signature}) {
        if(!message || !signature) return {error:-10}
        return {valid: this.account.verify(message, signature)}
    }

    /* Profile */

    async addContact ({name, address}){
        if(!name || !address) return {error:-10}
        return {valid: await this.account.addContact(name, address)}
    }

    async getContacts (){
        return await this.account.getContacts()
    }

    async removeContact ({address}){
        if(!address) return {error:-10}
        return await this.account.removeContact(address)
    }

    async getConfig({force}){
        return {config: await this.account.getConfig(force)}
    }

}