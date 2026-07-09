import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true, // in paise
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  referenceId: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true,
    index: true,
  },
  balance: {
    type: Number,
    default: 0, // in paise
  },
  transactions: [transactionSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

walletSchema.virtual('balanceInRupees').get(function () {
  return (this.balance / 100).toFixed(2);
});

/**
 * Credit funds to wallet.
 * @param {Number} amount - Amount in paise
 * @param {String} description - Transaction description
 * @param {String} referenceId - Optional reference
 */
walletSchema.methods.credit = async function (amount, description, referenceId = '') {
  this.balance += amount;
  this.transactions.push({
    type: 'credit',
    amount,
    description,
    referenceId,
  });
  return this.save();
};

/**
 * Debit funds from wallet.
 * @param {Number} amount - Amount in paise
 * @param {String} description - Transaction description
 * @param {String} referenceId - Optional reference
 * @throws {Error} If insufficient balance
 */
walletSchema.methods.debit = async function (amount, description, referenceId = '') {
  if (this.balance < amount) {
    const err = new Error('Insufficient wallet balance');
    err.statusCode = 400;
    throw err;
  }
  this.balance -= amount;
  this.transactions.push({
    type: 'debit',
    amount,
    description,
    referenceId,
  });
  return this.save();
};

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
