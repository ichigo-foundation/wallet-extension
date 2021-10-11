/* util.js */

const util = {

    hexToBase64: (str) => {
        return btoa(String.fromCharCode.apply(null,
          str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
        )
    },

    base64ToHex: (str) => {
        for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
            let tmp = bin.charCodeAt(i).toString(16);
            if (tmp.length === 1) tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join("");
    },

    hexToBuf: (str) => {
        return new Uint8Array(str.match(/[\da-f]{2}/gi).map( (h) => { 
            return parseInt(h, 16) 
        })) 
    },

    base64ToBuf: (str) => {
        return util.hexToBuf( util.base64ToHex(str) )
    },

    bufToHex: (buf) =>{
        return new TextDecoder().decode(buf)
    }

}