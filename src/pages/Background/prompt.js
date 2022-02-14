
const prompt = async (account) => {
    // get the currently focused window dims
    let wins =  await chrome.windows.getAll()
    let {top, left, height, width} = wins.filter( w => w.focused == true)[0]


    // TODO : place the popup at the right place in screen
    let popup = await chrome.windows.create({url: '/popup.html', type: 'popup', focused:true, height:620, width:386, top:(top+45), left:(left+width-386-15)})

    return new Promise( (resolve, reject) => {
        let popupTick = setInterval(async function() {
            if( !(await chrome.windows.getAll()).map( p => p.id).includes(popup.id) || // window is closed
                account.status == ACCOUNT_STATUS.unlocked // or the account has been unlocked
            ){
                clearInterval(popupTick)
                try{ await chrome.windows.remove(popup.id) }catch{ resolve() }
                resolve()
            }
        }, 100)
    })
}
