import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  image: { type: String, default: '' },
  category: {
    type: String,
    enum: ['veg', 'nonveg', 'vegan'],
    required: true,
  },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  tags: [{ type: String, trim: true }],
  isAvailable: { type: Boolean, default: true },
  price: { type: Number, default: 6000 }, // in paise
}, { _id: true });

const priceSchema = new mongoose.Schema({
  single: { type: Number, required: true },   // in paise
  weekly: { type: Number, required: true },    // in paise
  monthly: { type: Number, required: true },   // in paise
}, { _id: false });

const menuSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Menu date is required'],
    index: true,
  },
  mealType: {
    type: String,
    enum: ['lunch', 'dinner'],
    required: [true, 'Meal type is required'],
  },
  items: [menuItemSchema],
  price: {
    type: priceSchema,
    required: true,
  },
  isPublished: { type: Boolean, default: false },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound unique index: one menu per date+mealType
menuSchema.index({ date: 1, mealType: 1 }, { unique: true });

menuSchema.virtual('totalCalories').get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((sum, item) => sum + (item.calories || 0), 0);
});

menuSchema.virtual('vegItems').get(function () {
  return (this.items || []).filter((item) => item.category === 'veg');
});

menuSchema.virtual('nonvegItems').get(function () {
  return (this.items || []).filter((item) => item.category === 'nonveg');
});

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
