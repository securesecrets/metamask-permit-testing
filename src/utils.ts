/**
* Base64 encode JSON data
* */
const encodeJsonToB64 = (toEncode:any) : string => Buffer.from(JSON.stringify(toEncode), 'utf8').toString('base64');

export {
  encodeJsonToB64,
}