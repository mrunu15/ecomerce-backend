import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Product Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter Product Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Product Price"],
    maxLength: [7, "Price cannot exceed 7 digits"],
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  ratings: {
    type: Number,
    default: 0,
  },

  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],

  category: {
    type: String,
    required: [true, "Please Enter Product Category"],
    enum: ["shoes", "tshirt", "lower", "watch"],
  },

  details: {
    shoes: {
      size: [{ type: String }], // e.g. ["7","8","9"]
    },
    tshirt: {
      size: [{ type: String }], // e.g. ["S","M","L","XL"]
    },
    lower: {
      size: [{ type: String }], // e.g. ["S","M","L","XL"]
    },
    watch: {
      brand: {
        type: String,
        required: false, 
        trim: true,
      },
      waterResistant: {
        type: Boolean,
        default: false,
      },
    },
  },

  stock: {
    type: Number,
    required: [true, "Please Enter Product Stock"],
    maxLength: [5, "Stock cannot exceed 5 digits"],
    default: 1,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      images: [
        {
          public_id: {
            type: String,
          },
          url: {
            type: String,
          },
        },
      ],
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Product", productSchema);
