import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu',
  },
  date: {
    type: Date,
    required: [true, 'Order date is required'],
    index: true,
  },
  mealType: {
    type: String,
    enum: ['lunch', 'dinner'],
    required: [true, 'Meal type is required'],
  },
  status: {
    type: String,
    enum: ['scheduled', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'scheduled',
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
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deliveryProof: {
    image: { type: String, default: '' },
    notes: { type: String, default: '' },
    timestamp: { type: Date },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
    createdAt: { type: Date },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderSchema.index({ user: 1, date: -1 });
orderSchema.index({ deliveryPartner: 1, date: 1 });
orderSchema.index({ status: 1, date: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
