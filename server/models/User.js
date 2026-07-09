import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: 'Home' },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true, default: '' },
  city: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { _id: true });

const dietaryPreferencesSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['veg', 'nonveg', 'vegan'],
    default: 'veg',
  },
  allergies: [{ type: String, trim: true }],
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'spicy'],
    default: 'medium',
  },
  calorieTarget: { type: Number, default: 2000 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    index: true,
  },
  name: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  passwordHash: { type: String, select: false },
  role: {
    type: String,
    enum: ['customer', 'admin', 'delivery'],
    default: 'customer',
  },
  addresses: [addressSchema],
  dietaryPreferences: {
    type: dietaryPreferencesSchema,
    default: () => ({}),
  },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.virtual('displayName').get(function () {
  return this.name || `User-${this.phone.slice(-4)}`;
});

userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
