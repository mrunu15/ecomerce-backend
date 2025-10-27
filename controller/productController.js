import Product from "../models/productModel.js";
import HandleError from "../utils/handleError.js";
import handleAsyncError from "../middleware/handleAsyncError.js";
import APIFunctionality from "../utils/apiFunctionality.js";
import { v2 as cloudinary } from "cloudinary";


export const createProducts = async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ success: false, message: "No images uploaded" });
    }

    const uploadedFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const images = await Promise.all(
      uploadedFiles.map(file =>
        cloudinary.uploader.upload(file.tempFilePath, { folder: "products" })
      )
    );

    let details = {};
    if (req.body.details) {
      try {
        details = typeof req.body.details === "string" 
          ? JSON.parse(req.body.details) 
          : req.body.details;
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid details JSON" });
      }
    }

    details.shoes = details.shoes || { size: [] };
    details.tshirt = details.tshirt || { size: [] };
    details.lower = details.lower || { size: [] };
    details.watch = details.watch || { waterResistant: false };

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      discountPrice: req.body.discountPrice || 0,
      category: req.body.category,
      stock: req.body.stock,
      details,
      images: images.map(img => ({
        public_id: img.public_id,
        url: img.secure_url,
      })),
      user: req.user.id,
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// 2️⃣ Get all products
export const getAllProducts = handleAsyncError(async (req, res, next) => {
  const resultsPerPage = 12;
  const apiFeatures = new APIFunctionality(Product.find(), req.query)
    .search()
    .filter();

  const filteredQuery = apiFeatures.query.clone();
  const productCount = await filteredQuery.countDocuments();

  const totalPages = Math.ceil(productCount / resultsPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && productCount > 0) {
    return next(new HandleError("This page doesn't exist", 404));
  }

  apiFeatures.pagination(resultsPerPage);
  const products = await apiFeatures.query;

  if (!products || products.length === 0) {
    return next(new HandleError("No Product Found", 404));
  }

  res.status(200).json({
    success: true,
    products,
    productCount,
    resultsPerPage,
    totalPages,
    currentPage: page,
  });
});

// 3️⃣ Update Product
export const updateProduct = handleAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new HandleError("Product Not Found", 404));
  }

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else if (Array.isArray(req.body.images)) {
    images = req.body.images;
  }

  if (images.length > 0) {
    // Delete old images
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id);
    }

    // Upload new images
    const imageLinks = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: "products",
      });
      imageLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images = imageLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// 4️⃣ Delete Product
export const deleteProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new HandleError("Product Not Found", 404));
  }

  // Delete product images from Cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.uploader.destroy(product.images[i].public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product Deleted successfully",
  });
});

// 5️⃣ Get Single Product
export const getSingleProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new HandleError("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// 6️⃣ Create/Update Review
export const createReviewForProduct = handleAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new HandleError("Product not found", 400));
  }

  // --- Upload Images (same logic as createProducts) ---
  let images = [];
  if (req.files && req.files.images) {
    const uploadedFiles = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    const uploadedImages = await Promise.all(
      uploadedFiles.map((file) =>
        cloudinary.uploader.upload(file.tempFilePath, { folder: "reviews" })
      )
    );

    images = uploadedImages.map((img) => ({
      public_id: img.public_id,
      url: img.secure_url,
    }));
  }


  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    images,
  };

  const reviewExists = product.reviews.find(
    (rev) => rev.user.toString() === req.user.id.toString()
  );

  if (reviewExists) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user.id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
        rev.images = images.length > 0 ? images : rev.images; 
      }
    });
  } else {
    product.reviews.push(review);
  }

  product.numOfReviews = product.reviews.length;

  let sum = 0;
  product.reviews.forEach((rev) => {
    sum += rev.rating;
  });

  product.ratings =
    product.reviews.length > 0 ? sum / product.reviews.length : 0;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});



// 7️⃣ Get Reviews
export const getProductReviews = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new HandleError("Product not found", 400));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// 8️⃣ Delete Review
export const deleteReview = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new HandleError("Product not found", 400));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let sum = 0;
  reviews.forEach((rev) => {
    sum += rev.rating;
  });

  const ratings = reviews.length > 0 ? sum / reviews.length : 0;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Review Deleted Successfully",
  });
});

// 9️⃣ Admin - Get All Products
export const getAdminProducts = handleAsyncError(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});
