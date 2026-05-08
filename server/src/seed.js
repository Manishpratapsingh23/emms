import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Department from './models/Department.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});

    // Create departments
    const departments = await Department.insertMany([
      { name: 'Engineering', description: 'Software development and engineering' },
      { name: 'Human Resources', description: 'HR and people operations' },
      { name: 'Marketing', description: 'Marketing and brand management' },
      { name: 'Finance', description: 'Financial operations and accounting' },
      { name: 'Sales', description: 'Sales and business development' },
    ]);
    console.log('Departments seeded');

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@emms.com',
      password: 'admin123',
      role: 'admin',
      designation: 'System Administrator',
      salary: 100000,
      status: 'active',
      department: departments[1]._id,
    });
    console.log('Admin created: admin@emms.com / admin123');

    // Create employees
    const employees = [
      { name: 'John Smith', email: 'john@emms.com', password: 'password123', designation: 'Senior Developer', salary: 85000, department: departments[0]._id },
      { name: 'Jane Doe', email: 'jane@emms.com', password: 'password123', designation: 'UI/UX Designer', salary: 75000, department: departments[0]._id },
      { name: 'Bob Wilson', email: 'bob@emms.com', password: 'password123', designation: 'Marketing Manager', salary: 80000, department: departments[2]._id },
      { name: 'Alice Brown', email: 'alice@emms.com', password: 'password123', designation: 'HR Specialist', salary: 70000, department: departments[1]._id },
      { name: 'Charlie Davis', email: 'charlie@emms.com', password: 'password123', designation: 'Financial Analyst', salary: 78000, department: departments[3]._id },
    ];

    for (const emp of employees) {
      await User.create({ ...emp, role: 'employee', status: 'active' });
    }
    console.log('Employees seeded');
    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
