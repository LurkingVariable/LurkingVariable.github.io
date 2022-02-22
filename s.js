function arraysEqual(a, b) {
    if (a.length != b.length)
        return false;

    for (var i=0; i < a.length; i++)
        if (a[i] != b[i])
            return false;
    return true;
}

var ImageTransmitter = (function() {
    var btn;
    var fileinput;
    var transmit;
    var payload = "";
    var warningbox;

    function onTransmitFinish() {
        btn.addEventListener('click', onClick, false);
        btn.disabled = false;
        var originalText = btn.innerText;
        btn.innerText = btn.getAttribute('data-quiet-sending-text');
        btn.setAttribute('data-quiet-sending-text', originalText);
    };

    function onClick(e) {
        e.target.removeEventListener(e.type, arguments.callee);
        e.target.disabled = true;
        var originalText = e.target.innerText;
        e.target.innerText = e.target.getAttribute('data-quiet-sending-text');
        e.target.setAttribute('data-quiet-sending-text', originalText);
        if (payload === "") {
            onTransmitFinish();
            return;
        }
        var frags = 40;
        var errors = 10;
        console.log(payload.byteLength);
        var name = "file" + payload.byteLength + ".zip";
        //const raw = new Uint8Array(5*1024*1024);
        //console.log(raw.byteLength);
        //var temp = Uint8Array.from(payload);
        //console.log(temp.byteLength);
        //console.log(temp);
        //var temp2 = new Blob([temp]);
        //console.log(temp2.byteLength); 
        //console.log(temp2);
        //saveAs(temp2, name); 
        //var bfrags = erasure.split(temp, frags, errors);
        //var decoded = erasure.recombine(bfrags, temp.byteLength, 40, 10);
        var bfrags = erasure.split(payload, frags, errors);
        var decoded = erasure.recombine(bfrags, payload.byteLength, 40, 10);
        console.log(decoded.byteLength);
        saveAs(decoded, name);
        console.log(arraysEqual(payload,decoded));
        console.log(bfrags.length);
        var rspl = bfrags[0];
        console.log(rspl);
        console.log(bfrags);
        console.log(bfrags[1]);
        var len = bfrags.length;
        console.log(len);
        for (var i=1; i < 60; i++) 
            rspl = Quiet.mergeab(rspl, bfrags[i]);
        console.log(rspl);
        console.log(payload);
        //transmit.transmit(rspl);
        transmit.transmit(payload);
    };

    function onFileRead(e) {
        payload = e.target.result;
    };

    function onFileSelect(e) {
        var reader = new FileReader()
        reader.onload = onFileRead;
        reader.readAsArrayBuffer(e.target.files[0]);
    };

    function onQuietReady() {
        var profilename = btn.getAttribute('data-quiet-profile-name');
        transmit = Quiet.transmitter({profile: profilename, onFinish: onTransmitFinish});
        btn.addEventListener('click', onClick, false);
        fileinput.addEventListener('change', onFileSelect, false);
    };

    function onQuietFail(reason) {
        console.log("quiet failed to initialize: " + reason);
        warningbox.classList.remove("hidden");
        warningbox.textContent = "Sorry, it looks like there was a problem with this example (" + reason + ")";
    };

    function onDOMLoad() {
        btn = document.querySelector('[data-quiet-send-image-button]');
        fileinput = document.querySelector('[data-quiet-file-input]');
        warningbox = document.querySelector('[data-quiet-send-image-warning]');

        Quiet.addReadyCallback(onQuietReady, onQuietFail);
    };

    document.addEventListener("DOMContentLoaded", onDOMLoad);
})();
