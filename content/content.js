/* content.js */

const forwardEvent = (event) => {
    // if the message is corectly formatted
    if( event.data != undefined && event.data.target == 'resolut-content' && event.data.action != undefined )
    {   
        // forward the event to background
        chrome.runtime.sendMessage({target:'resolut-background', action: event.data.action, payload: event.data.payload}, function(res) {
            // notify the response to the page
            window.postMessage({target:'resolut-page', action: event.data.action, payload: res},'*')
        })
    }
}

window.addEventListener('message', forwardEvent)


/********************** IN BROWSER TEST
window.addEventListener('message', (msg) => { if( msg.data != undefined && msg.data.target=='resolut-page') console.log(msg.data.payload) })
window.postMessage({target:'resolut-content', action:'getAddress', payload:'0xabcde'}, '*')
window.postMessage({target:'resolut-content', action:'encrypt', payload:'HELLO WORLD'}, '*')
********************************************/
