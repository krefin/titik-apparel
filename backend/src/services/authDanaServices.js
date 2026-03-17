const crypto = require("crypto");
const { createHash } = require('crypto');

function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}

// Sample keys I've generated
const privateKey = proccs.env.PRIVATE_KEY;

//$data = '<HTTP METHOD> + ”:” + <RELATIVE PATH URL> + “:“ + LowerCase(HexEncode(SHA-256(Minify(<HTTP BODY>)))) + “:“ + <X-TIMESTAMP>';
const path = '/v1.0/hello-world';
const timestamp = '1970-01-01T00:00:00+00:00';
const data = 'POST:'+path+':'+hash('{"foo":"bar"}')+':'+timestamp;
console.log("string to sign:", data);

const content = 'POST:/v1.0/qr/apply-ott.htm:5d64eff4f600b8c04ddaa3b11ae4fa4f49eafc9938e6d174e6d2524884fc0e67:2023-12-18T17:37:09+07:00';

const signature = signContent(content, base64KeyToPEM(privateKey, "PRIVATE"), "utf8");

console.log("Signature:", signature);

function signContent(content, privateKey, encoding) {
    const sign = crypto.createSign("SHA256");
    sign.write(content, encoding);
    sign.end();
    return sign.sign(privateKey, "base64");
}

function verifySignature(content, publicKey, signature, encoding) {
    const verify = crypto.createVerify("SHA256");    
    verify.write(content, encoding);
    verify.end();
    return verify.verify(publicKey, Buffer.from(signature, "base64"));
}

function base64KeyToPEM(base64Key, keyType) {
    return [`-----BEGIN ${keyType} KEY-----`, ...splitStringIntoChunks(base64Key, 64), `-----END ${keyType} KEY-----`].join("\n");
}

function splitStringIntoChunks(input, chunkSize) {
    const chunkCount = Math.ceil(input.length / chunkSize)
    return Array.from( { length: chunkCount } ).map((v, chunkIndex) => input.substr(chunkIndex * chunkSize, chunkSize));
}