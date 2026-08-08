import jwt from 'jsonwebtoken';

// Generate a JWT token for session storage
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Calculate overdue late fees based on current date vs rental deadline
// (This is a skeleton utility; customize it with specific business logic later)
export const calculateLateFee = (endDate, actualReturnDate, pricePerDay) => {
  const end = new Date(endDate);
  const returned = new Date(actualReturnDate);
  
  if (returned <= end) return 0;
  
  const diffTime = Math.abs(returned - end);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Example rule: late fee is 1.5x daily rent price per day overdue
  const feeRate = 1.5;
  return diffDays * pricePerDay * feeRate;
};
