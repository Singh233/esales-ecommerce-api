const mongoose = require('mongoose');
const { softDelete, paginate, toJSON } = require('./plugins/index.js');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  color: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty for guest carts
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'abandoned', 'converted'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 86400 * 7, // 7 days
    },
  },
  {
    timestamps: true,
  },
);

// Update totals before saving
cartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  next();
});

// Create compound index for efficient querying
cartSchema.index({ userEmail: 1, status: 1 });

cartSchema.plugin(softDelete);
cartSchema.plugin(paginate);
cartSchema.plugin(toJSON);

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
