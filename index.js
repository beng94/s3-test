const aws = require('aws-sdk');
const config = require('./config');

let s3;

const init = () => {
    aws.config.update({
        accessKeyId: config.aws.keyId,
        secretAccessKey: config.aws.keySecret
    });

    s3 = new aws.S3();
};

const signFile = (file) => {
    const url = s3.getSignedUrl('getObject', {
        Bucket: config.aws.bucket,
        Key: file,
        Expires: config.aws.expire
    });
    return url;
};


init();

const file = 'monkey.txt';
const url = signFile(file);
console.log(url);
