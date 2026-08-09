import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const seedNotifications = async () => {
  console.log('🌱 [7/7] Seeding 2,000 User Notification Documents...');

  const users = await User.find();
  if (users.length === 0) throw new Error('Users missing for seeding notifications');

  const types = [
    'booking_confirmed',
    'return_reminder',
    'late_return',
    'payment_success',
    'refund_issued',
    'vendor_approval',
    'product_approved',
    'wishlist_offer',
    'discount',
  ];

  const notificationDocs = [];

  for (let i = 0; i < 2000; i++) {
    const user = users[i % users.length];
    const nType = types[i % types.length];

    let title = 'System Notification';
    let message = 'You have a new update regarding your RentSphere account.';

    if (nType === 'booking_confirmed') {
      title = 'Rental Booking Confirmed!';
      message = 'Your equipment rental agreement has been approved by the vendor.';
    } else if (nType === 'return_reminder') {
      title = 'Return Reminder Due Soon';
      message = 'Please schedule your return before the lease expiration to avoid late fees.';
    } else if (nType === 'late_return') {
      title = 'Late Return Hourly Fee Notice';
      message = 'Your rental return is overdue. Hourly late fees are currently accruing.';
    } else if (nType === 'payment_success') {
      title = 'Payment Received & Escrow Held';
      message = 'Your security deposit and rental payment were processed successfully.';
    } else if (nType === 'refund_issued') {
      title = 'Security Deposit Released!';
      message = 'Return inspection completed. Your security deposit refund has been issued.';
    } else if (nType === 'wishlist_offer') {
      title = 'Special Discount on Saved Equipment';
      message = 'An item on your wishlist is now available at a 15% lower daily rate.';
    }

    notificationDocs.push({
      user: user._id,
      title,
      message,
      type: nType,
      isRead: i % 3 === 0,
      createdAt: faker.date.past({ years: 1 }),
    });
  }

  await Notification.insertMany(notificationDocs);
  const totalNotifications = await Notification.countDocuments();
  console.log(`✅ Notifications (${totalNotifications}) seeded successfully!`);
};
