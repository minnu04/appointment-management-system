const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase(), role: 'admin' });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: 'System Admin',
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
    verified: true,
    approved: true,
  });

  console.log(`Seeded admin account for ${adminEmail}`);
};

module.exports = { seedAdmin };