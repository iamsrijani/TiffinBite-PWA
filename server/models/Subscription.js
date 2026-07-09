import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true,
  },
  plan: {
    type: String,
    enum: ['trial', 'weekly', 'monthly'],
    required: [true, 'Plan is required'],
  },
  mealType: {
    type: String,
    enum: ['lunch', 'dinner', 'both'],
    required: [true, 'Meal type is required'],
  },
  dietType: {
    type: String,
    enum: ['veg', 'nonveg', 'vegan'],
    required: [true, 'Diet type is required'],
  },
  deliveryAddress: {
    label: { type: String, trim: true, default: 'Home' },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'expired', 'cancelled'],
    default: 'active',
    index: true,
  },
  pausedDates: [{ type: Date }],
  pauseCutoffTime: {
    type: String,
    default: '20:00',
  },
  totalMeals: { type: Number, required: true },
  mealsDelivered: { type: Number, default: 0 },
  mealsRemaining: { type: Number },
  amountPaid: { type: Number, default: 0 }, // in paise
  paymentId: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

subscriptionSchema.virtual('progress').get(function () {
  if (!this.totalMeals || this.totalMeals === 0) return 0;
  return Math.round((this.mealsDelivered / this.totalMeals) * 100);
});

subscriptionSchema.pre('save', function () {
  if (this.isModified('totalMeals') || this.isModified('mealsDelivered')) {
    this.mealsRemaining = this.totalMeals - this.mealsDelivered;
  }
});

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
