// EncHelper.js
import CryptoJS from "crypto-js";

const secret = "123sdfjk";

class EncHelper {
  static setItem = (key, data) => {
    // Encrypt data
    const enc_data = CryptoJS.AES.encrypt(data, secret, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    sessionStorage.setItem(key, enc_data);
  };

  static getItem = (key) => {
    const data = sessionStorage.getItem(key);
    if (!data) return null;

    const dec_data_bytes = CryptoJS.AES.decrypt(data, secret, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    const dec_data = dec_data_bytes.toString(CryptoJS.enc.Utf8);
    return dec_data;
  };
}

export default EncHelper;
