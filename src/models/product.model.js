const mongoose = require('mongoose');
const { softDelete, paginate, toJSON } = require('./plugins/index.js');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one image is required',
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    colors: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    rating: {
      rate: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

productSchema.plugin(softDelete);
productSchema.plugin(paginate);
productSchema.plugin(toJSON);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
