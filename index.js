const aws = require('aws-sdk');
const fs = require('fs');
const request = require('request');
const fetch = require('node-fetch');
const FormData = require('form-data');
const config = require('./config');

let s3;

const init = () => {
    aws.config.update({
        signatureVersion: 'v4',
        region: 'eu-central-1',
        accessKeyId: config.aws.keyId,
        secretAccessKey: config.aws.keySecret
    });

    s3 = new aws.S3({signatureVersion: 'v4'});
};

const signFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: config.aws.bucket,
            Fields: {
                key: filePath
            },
            Expires: config.aws.expire,
            Conditions: [
                ['content-length-range', 0, 10000000], // 10 Mb
                {'acl': 'public-read'}
            ]
        };
        s3.createPresignedPost(params, (err, data) => {
            resolve(data);
        });
    });
};

const sendFile = (filePath, payload) => {
    const form = new FormData();
    form.append('acl', 'public-read');
    for(const field in payload.fields) {
        form.append(field, payload.fields[field]);
    }
    form.append('file', fs.createReadStream(__dirname + `/${filePath}`));
    form.getLength((err, length) => {
        fetch(payload.url, {
            method: 'POST',
            body: form,
            headers: {
                'Content-Type': false,
                'Content-Length': length
            }
        })
        .then((response) => {
            console.log(response.status);
            return response.text(); })
        .then((payload) => { console.log(payload); })
        .catch((err) => console.log(`Error: ${err}`));
    });
};


init();

const file = 'test.pdf';
const filePath = `files/new/${file}`;
signFile(filePath)
.then((payload) => {
    console.log(`Upload: ${payload.upload}`);
    console.log(`Download: ${payload.download}`);
    sendFile(file, payload);
});

