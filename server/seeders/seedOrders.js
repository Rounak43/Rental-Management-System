import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Rental from '../models/Rental.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const seedOrders = async () => {
  console.log('🌱 [3/7] Seeding 1,800 Rental Orders...');

  const customers = await User.find({ role: 'customer' });
  const products = await Product.find();

  if (customers.length === 0 || products.length === 0) {
    throw new Error('Customers or Products missing for seeding orders');
  }

  const orderDocs = [];
  const statusOptions = ['returned', 'returned', 'returned', 'active', 'pending', 'overdue', 'cancelled'];
  const lateDaysOptions = [0, 0, 0, 1, 3, 7, 15];

  for (let i = 0; i < 1800; i++) {
    const customer = customers[i % customers.length];
    const product = products[i % products.length];

    const durationDays = faker.number.int({ min: 2, max: 14 });
    const createdDate = faker.date.past({ years: 2 });
    const rentStartDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
    const rentEndDate = new Date(rentStartDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const totalCost = durationDays * product.pricePerDay;
    const securityDepositPaid = product.securityDeposit || product.pricePerDay * 2;
    const status = statusOptions[i % statusOptions.length];

    let actualReturnDate = null;
    let lateHours = 0;
    let lateFee = 0;
    let damageCharges = 0;
    let depositDeducted = 0;
    let refundAmount = 0;
    let returnCondition = 'good';
    let repairRequired = false;

    if (status === 'returned') {
      const lateDays = lateDaysOptions[i % lateDaysOptions.length];
      actualReturnDate = new Date(rentEndDate.getTime() + lateDays * 24 * 60 * 60 * 1000);
      lateHours = lateDays * 24;

      if (lateDays > 0) {
        const hourlyRate = product.lateFeePerHour || 50;
        const maxFee = product.maximumLateFee || 500;
        lateFee = Math.min(lateHours * hourlyRate, maxFee);
      }

      if (i % 10 === 0) {
        damageCharges = faker.number.int({ min: 300, max: 1500 });
        returnCondition = 'damaged';
        repairRequired = true;
      }

      const totalDeductions = lateFee + damageCharges;
      refundAmount = Math.max(0, securityDepositPaid - totalDeductions);
      depositDeducted = Math.min(securityDepositPaid, totalDeductions);
    } else if (status === 'overdue') {
      lateHours = faker.number.int({ min: 12, max: 72 });
      const hourlyRate = product.lateFeePerHour || 50;
      lateFee = Math.min(lateHours * hourlyRate, product.maximumLateFee || 500);
    }

    const pickupStatus = (status === 'active' || status === 'returned' || status === 'overdue') ? 'picked_up' : 'pending';
    const returnStatus = status === 'returned' ? 'returned' : 'pending';
    const invoiceId = `INV-${Date.now().toString().slice(-6)}${i + 1000}`;

    orderDocs.push({
      user: customer._id,
      product: product._id,
      rentStartDate,
      rentEndDate,
      actualReturnDate,
      totalCost,
      securityDepositPaid,
      status,
      pickupStatus,
      returnStatus,
      lateFee,
      lateHours,
      damageCharges,
      refundAmount,
      depositDeducted,
      penaltyDeducted: damageCharges,
      returnCondition,
      repairRequired,
      invoiceId,
      pickupOTP: faker.string.numeric(6),
      pickupQRCode: `QR-${i + 1000}`,
      pickupConfirmedAt: pickupStatus === 'picked_up' ? rentStartDate : null,
      returnConfirmedAt: status === 'returned' ? actualReturnDate : null,
      createdAt: createdDate,
      updatedAt: actualReturnDate || createdDate,
    });
  }

  await Rental.insertMany(orderDocs);
  const totalOrders = await Rental.countDocuments();
  console.log(`✅ Rental Orders (${totalOrders}) seeded successfully!`);
};
