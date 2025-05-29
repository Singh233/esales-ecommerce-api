const mongoose = require('mongoose');
const { softDelete, paginate, toJSON } = require('./plugins/index.js');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
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

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contact: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate: {
          validator: function (v) {
            return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid email!`,
        },
      },
      phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
          validator: function (v) {
            return /^\+?[1-9]\d{1,14}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid phone number!`,
        },
      },
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Add pre-save middleware to generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

orderSchema.plugin(softDelete);
orderSchema.plugin(paginate);
orderSchema.plugin(toJSON);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
