import { emergepaySdk } from "emergepay-sdk";

const oid = process.env.REACT_APP_EMERGEPAY_OID;
const authToken = process.env.REACT_APP_EMERGEPAY_AUTH_TOKEN;
const environmentUrl = process.env.REACT_APP_EMERGEPAY_ENVIRONMENT_URL;

export const emergepay = new emergepaySdk({
  oid: oid,
  authToken: authToken,
  environmentUrl: environmentUrl,
});
