const js2xmlparser = require('js2xmlparser');
let winrm_soap_req = require('./base-request.js') 
let winrm_http_req = require('./http.js') 

function constructReceiveOutputRequest(_params) {
    var res = winrm_soap_req.getSoapHeaderRequest({
        "resource_uri": "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd",
        "action": "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive"
    });

    res['s:Header']['wsman:SelectorSet'] = [];
    res['s:Header']['wsman:SelectorSet'].push({
        "wsman:Selector": [{
            "@": {
                "Name": "ShellId"
            },
            "#": _params.shellid
        }]
    });
    res['s:Body'] = {
        "rsp:Receive": {
            "rsp:DesiredStream": {
                "@": {
                    "CommandId": _params.commandId
                },
                "#": "stdout stderr"
            }
        }
    };
    return js2xmlparser.parse('s:Envelope', res);

}

module.exports.doReceiveOutput = async function (_params) {
    console.log("In doReceiveOutput()..STARTS")
    var req = constructReceiveOutputRequest(_params);
    console.log("doReceiveOutput EQUEST....: ",req);

    var result = await winrm_http_req.sendHttp(req, _params.host, _params.port, _params.path, _params.auth);
    console.log("doReceiveOutput RESULT: ", result)

    if (result['s:Envelope']['s:Body'][0]['s:Fault']) {
        return new Error(result['s:Envelope']['s:Body'][0]['s:Fault'][0]['s:Code'][0]['s:Subcode'][0]['s:Value'][0]);
    } else {
        var output = result['s:Envelope']['s:Body'][0]['rsp:ReceiveResponse'][0]['rsp:Stream'];
        return output;
    }
}