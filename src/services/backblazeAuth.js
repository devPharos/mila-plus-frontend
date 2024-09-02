import axios from "axios";

const backblazeConfig = {
    applicationKeyId: "005fdfd7d4c4e4a0000000001",
    applicationKey: "K005jdl5VEymAPpJqUpckpzFT+7+2Ao",
    bucketId: "cf3d8f1d672db43c941e041a",
    endpoint: "s3.us-east-005.backblazeb2.com"
};

const backblazeAuth = axios.create({
    baseURL: 'https://api.backblazeb2.com',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': btoa(backblazeConfig.applicationKeyId + ':' + backblazeConfig.applicationKey),
        'Access-Control-Allow-Origin': '*'
    }
});

export default backblazeAuth;
