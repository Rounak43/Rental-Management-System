import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Payment from '../models/Payment.js';
import Rental from '../models/Rental.js';

export const seedPayments = async () => {
  console.log('🌱 [4/7] Seeding 600 Payment & Invoice Ledger Records...');

  const rentals = await Rental.find().populate('user');
  if (rentals.length === 0) throw new Error('No rentals found for seeding payments');

  const paymentMethods = ['UPI', 'Card', 'Net Banking', 'Cash', 'Wallet'];
  const paymentDocs = [];

  rentals.forEach((rental, idx) => {
    const isReturned = rental.status === 'returned';
    const isCancelled = rental.status === 'cancelled';
    const pMethod = faker.helpers.arrayElement(paymentMethods);

    // Initial rental payment record
    paymentDocs.push({
      rental: rental._id,
      user: rental.user._id,
      amount: rental.totalCost + rental.securityDepositPaid,
      paymentMethod: pMethod,
      status: isCancelled ? 'refunded' : (rental.status === 'pending' && idx % 7 === 0 ? 'pending' : 'completed'),
      transactionId: `TXN_${Date.now()}_${idx + 1000}`,
      type: 'rental_payment',
      invoiceGenerated: true,
      invoiceId: rental.invoiceId || `INV-INIT-${idx + 1000}`,
      createdAt: rental.createdAt,
    });

    // If returned, add settlement payment record for deposit refund / late fee collection
    if (isReturned) {
      const isRefund = rental.refundAmount > 0;
      paymentDocs.push({
        rental: rental._id,
        user: rental.user._id,
        amount: isRefund ? rental.refundAmount : rental.depositDeducted,
        paymentMethod: isRefund ? 'deposit_refund' : 'late_fee_deduction',
        status: 'completed',
        transactionId: `SETTLE_${Date.now()}_${idx + 5000}`,
        type: isRefund ? 'deposit_refund' : 'late_fee_charge',
        depositRefund: rental.refundAmount,
        penaltyDeducted: rental.penaltyDeducted,
        lateFeeCollected: rental.lateFee,
        invoiceGenerated: true,
        invoiceId: rental.invoiceId || `INV-SETTLE-${idx + 5000}`,
        createdAt: rental.updatedAt || rental.createdAt,
      });
    }
  });

  await Payment.insertMany(paymentDocs);
  const totalPayments = await Payment.countDocuments();
  console.log(`✅ Payments & Invoices (${totalPayments}) seeded successfully!`);
};
