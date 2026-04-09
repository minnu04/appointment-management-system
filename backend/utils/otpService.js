const crypto = require('crypto');

const generateOtp = () => {
  const value = crypto.randomInt(100000, 1000000);
  return String(value);
};

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

module.exports = { generateOtp, hashOtp };