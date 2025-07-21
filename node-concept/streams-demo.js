const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");
const { Transform } = require("stream");

class EncryptStream extends Transform {
  constructor(key, vector) {
    super();
    this.key = key;
    this.vector = vector;
  }
  _transform(chunk, encoding, callback) {
    const cipher = crypto.createCipheriv("aes-256-cbc", this.key, this.vector);
    const encrypted = Buffer.concat([cipher.update(chunk), cipher.final()]);
    this.push(encrypted);
    callback();
  }
}

const key = crypto.randomBytes(32);
const vector = crypto.randomBytes(16);
//read stream from a file
const readableStream = fs.createReadStream("input.txt");

//will compress the stream
const gzipStream = zlib.createGzip();
//encrypt the stream
const encrptStream = new EncryptStream(key, vector);
//will write the stream
const writableStream = fs.createWriteStream("output.txt.gz.enc");

//the flow is read -> compress -> encrypt -> write

readableStream.pipe(gzipStream).pipe(encrptStream).pipe(writableStream);

console.log("reading stream -> compressing and the writing the stream");
