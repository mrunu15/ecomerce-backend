// import mongoose from "mongoose";

// const orderSchema=new mongoose.Schema({
//     shippingInfo:{
//         address:{
//             type:String,
//             required:true
//         },
//         city:{
//             type:String,
//             required:true
//         },
//         state:{
//             type:String,
//             required:true
//         },
//         country:{
//             type:String,
//             required:true
//         },
//         pinCode:{
//             type:Number,
//             required:true
//         },
//         phoneNo:{
//             type:Number,
//             required:true
//         }
//     },
//     orderItems:[
//         {
//             name:{
//                 type:String,
//                 required:true
//             },
//             price:{
//                 type:Number,
//                 required:true
//             },
//             quantity:{
//                 type:Number,
//                 required:true
//             },
//             image:{
//                 type:String,
//                 required:true
//             },
//             product:{
//                 type:mongoose.Schema.ObjectId,
//                 ref:'Product',
//                 required:true
//             }
//         }
//     ],
//     orderStatus:{
//         type:String,
//         required:true,
//         default:"Processing"
//     },
//     user:{
//         type:mongoose.Schema.ObjectId,
//         ref:"User",
//         required:true
//     },
//     paymentInfo:{
//         id:{
//             type:String,
//             required:true
//         },
//         status:{
//             type:String,
//             required:true
//         }
//     },
//     paidAt:{
//         type:Date,
//         required:true
//     },
//     itemPrice:{
//         type:Number,
//         required:true,
//         default:0
//     },
//     taxPrice:{
//         type:Number,
//         required:true,
//         default:0 
//     },
//     shippingPrice:{
//         type:Number,
//         required:true,
//         default:0
//     },
//     totalPrice:{
//         type:Number,
//         required:true,
//         default:0
//     },
//     deliveredAt:Date,
//     createdAt:{
//        type:Date,
//        default:Date.now 
//     }
// })

// export default mongoose.model('Order',orderSchema)









import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pinCode: { type: Number },
    phoneNo: { type: Number },
  },

  orderItems: [
    {
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
      image: { type: String },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
    },
  ],

  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  paymentInfo: {
    id: { type: String, default: null },
    status: { type: String, default: "Pending" },
    method: {
      type: String,
      enum: ["Online", "COD"],
      required: true,
    },
  },

  paidAt: {
    type: Date,
  },

  itemPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },

  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);
