import { SYS } from '../../lib/utils.js';

const PROVIDER_URL = 'inPageScript.bundle.js'

function start(){
    window.addEventListener('message', forwardEvent)
}

function replyToPage(resp) {
    let id = resp.id
    delete resp.id
    window.postMessage({target: SYS.TARGET.PAGE, payload: resp, id: id},'*')
}

function forwardEvent (event) {
    if( event.data != undefined && event.data.target == SYS.TARGET.CONTENT && event.data.action != undefined ){
        chrome.runtime.sendMessage({target: SYS.TARGET.CONTENT, action: event.data.action, payload: event.data.payload, id: event.data.id}, replyToPage)
      }
}

function injectScript(url) {
  try {
    const container = document.head || document.documentElement
    const scriptTag = document.createElement('script')
    scriptTag.setAttribute('src', url)
    scriptTag.setAttribute('async', 'false')
    container.insertBefore(scriptTag, container.children[0])
    start()
  } catch (e) {
    console.error('ichigo provider injection failed: %s', e)
  }
}

function shouldInjectProvider() {
  return true
}

if (shouldInjectProvider()) {
  injectScript(chrome.runtime.getURL(PROVIDER_URL))
}