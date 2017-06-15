const aws = require('aws-sdk');
const fs = require('fs');
const request = require('request');
const config = require('./config');

let s3;

const init = () => {
    aws.config.update({
        signatureVersion: 'v4',
        region: 'eu-central-1',
        accessKeyId: config.aws.keyId,
        secretAccessKey: config.aws.keySecret
    });

    s3 = new aws.S3();
};

const signFile = (file) => {
    console.log(`Signing file: ${file}`);
    const putUrl = s3.getSignedUrl('putObject', {
        Bucket: config.aws.bucket,
        Key: file,
        Expires: config.aws.expire,
        ACL: 'public-read'
    });

    const payload = {
        upload: putUrl,
        download: putUrl.split('?')[0]
    };
    return payload;
};

const sendFile = (filePath, url) => {
    const formData = {
        my_file: fs.createReadStream(__dirname + `/${filePath}`)
    };
    request.put({ url: url, formData: formData }, (err, response, body) => {
        if(err) {
            console.log(`Error: ${err}`);
        }
    });
};


init();

const file = 'monkey.txt';
const payload = signFile(file);
console.log(`Upload: ${payload.upload}`);
console.log(`Download: ${payload.download}`);
sendFile(file, payload.upload);
