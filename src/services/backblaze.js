import axios from "axios";

const backblazeConfig = {
    applicationKeyId: "005fdfd7d4c4e4a0000000001",
    applicationKey: "K005jdl5VEymAPpJqUpckpzFT+7+2Ao",
    bucketId: "cf3d8f1d672db43c941e041a",
    endpoint: "s3.us-east-005.backblazeb2.com"
};

const backblaze = axios.create({
    baseURL: 'https://api005.backblazeb2.com',
    headers: {
        'Content-Type': 'application/json',
        'X-Bz-Content-Sha1': '',
        'Authorization': `4_005fdfd7d4c4e4a0000000001_01b6c95f_2bae28_acct_dVEh0OpqNjHAutnDno5K3JRCSc4=`,
        'Access-Control-Allow-Origin': '*',
    }
});

export default backblaze;
