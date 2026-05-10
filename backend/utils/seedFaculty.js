const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedFaculty = async () => {
  const facultyList = [
    {
      name: 'Dr. Alice Johnson',
      email: 'alice.johnson@college.edu',
      password: 'Password123',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      employeeId: 'F001',
    },
    {
      name: 'Dr. Bob Smith',
      email: 'bob.smith@college.edu',
      password: 'Password123',
      department: 'Mathematics',
      designation: 'Associate Professor',
      employeeId: 'F002',
    },
    {
      name: 'Dr. Carol Lee',
      email: 'carol.lee@college.edu',
      password: 'Password123',
      department: 'Physics',
      designation: 'Professor',
      employeeId: 'F003',
    },
  ];

  for (const f of facultyList) {
    const existing = await User.findOne({ email: f.email.toLowerCase(), role: 'faculty' });
    if (existing) continue;

    const hashed = await bcrypt.hash(f.password, 10);
    await User.create({
      name: f.name,
      email: f.email.toLowerCase(),
      password: hashed,
      role: 'faculty',
      verified: true,
      approved: true,
      department: f.department,
      designation: f.designation,
      employeeId: f.employeeId,
    });
  }

  console.log('Seeded faculty dummy data');
};

module.exports = { seedFaculty };
