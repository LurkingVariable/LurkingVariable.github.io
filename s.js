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
    var name = "";
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
        //var name = "file" + payload.byteLength + ".pdf";
        var frags = 40;
        var errors = 10;
        const raw = new Uint8Array(5*1024*1024);
        console.log(raw.byteLength);
        var bfrags = erasure.split(raw, 40, 10);
        var decoded = erasure.recombine(bfrags, raw.byteLength, 40, 10);
        console.log(arraysEqual(raw,decoded));
        //
        console.log(payload.byteLength);
        console.log(payload);
        var temp = new Blob([payload]);
        console.log(temp.byteLength); 
        console.log(temp);
        //saveAs(temp, name); 
        //Need to convert either Blob or ArrayBuffer to Uint8Array
        //var temp2 = Uint8Array.from(temp);
        //var temp2 = new Uint8Array(temp);
        var zip = new JSZip();
        zip.file(name, payload);
        //var temp2 = new Uint8Array(payload);
        var temp2 = new Uint8Array(zip);
        console.log(temp2.byteLength);
        console.log(temp2);
        console.log(arraysEqual(payload,temp2));  
        var temp3 = new Blob([temp2]);
        console.log(temp3.byteLength);
        console.log(temp3);
        //saveAs(temp3, name);       
        //
        var bfrags = erasure.split(temp2, 40, 10);
        //var decoded = erasure.recombine(bfrags, temp2.byteLength, 40, 10);
        //What happens if we don't trim the buffer to the right length? 
        var leng = bfrags[0].byteLength * 40;
        var decoded = erasure.recombine(bfrags, leng, 40, 10);
        console.log(arraysEqual(temp2,decoded));
        console.log(decoded.byteLength);
        console.log(decoded);
        console.log(temp2);
        var temp4 = new Blob([decoded]);
        console.log(temp4.byteLength);
        console.log(temp4);
        //saveAs(temp4, name);
        saveAs(temp4, "temp.zip");
        //
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
        name = e.target.files[0].name;
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
