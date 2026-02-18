import Product from "../models/productmodel.js";
import cloudinary from "../utility/cloudinary.js";
import getDataUri from "../utility/datauri.js";
import mongoose from "mongoose";


// export const addProduct = async (req, res) => {
//   try {
//     // 1️⃣ Get data from request body
//     const {
//       productName,
//       productDesc,
//       productPrice,
//       category,
//       brand,
//     } = req.body;

//     // 2️⃣ Get userId (from auth middleware)
//     const userId = req.id; // or req.user.id (depends on your auth middleware)

//     // 3️⃣ Validation
//     if (
//       !productName ||
//       !productDesc ||
//       !productPrice ||
//       !category ||
//       !brand
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // 4️⃣ Handle multiple image uploads
//     let productImg = [];
//     console.log(req.files);
    

//      if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         // convert buffer → data uri
//         const fileUri = getDataUri(file);

//         // upload to cloudinary
//         const result = await cloudinary.uploader.upload(fileUri, {
//           folder: "mern_products",
//         });

//         // push image data
//         productImg.push({
//           url: result.secure_url,
//           public_id: result.public_id,
//         });
//       }
//     }

//     // 5️⃣ Create product in database
//     const newProduct = await Product.create({
//       userId,
//       productName,
//       productDesc,
//       productPrice,
//       category,
//       brand,
//       productImg, // array of { url, public_id }
//     });

//     // 6️⃣ Send success response
//     return res.status(200).json({
//       success: true,
//       message: "Product added successfully",
//       product: newProduct,
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const addProduct = async (req, res) => {
  try {
    // 1️⃣ Get data from request body
    const {
      productName,
      productDesc,
      productPrice,
      category,
      brand,
    } = req.body;

    // 2️⃣ Get userId from auth middleware
    const userId = req.id; // or req.user._id

    // 3️⃣ Validation
    if (
      !productName ||
      !productDesc ||
      !productPrice ||
      !category ||
      !brand
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 4️⃣ Upload images to Cloudinary
    let productImg = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // convert buffer → base64 string
        const fileUri = getDataUri(file);

        // upload to cloudinary (IMPORTANT FIX)
        const result = await cloudinary.uploader.upload(
          fileUri.content,
          {
            folder: "mern_products",
          }
        );

        productImg.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // 5️⃣ Create product in database
    const newProduct = await Product.create({
      userId,
      productName,
      productDesc,
      productPrice,
      category,
      brand,
      productImg,
    });

    // 6️⃣ Success response
    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });

  } catch (error) {
    console.error("Add Product Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllProduct = async (_, res) => {
  try {
    const products = await Product.find();

    if (!products) {
      return res.status(404).json({
        success: false,
        message: "No product available",
        products: []
      });
    }

    return res.status(200).json({
      success: true,
      products
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    if (product.productImg && product.productImg.length > 0) {
      for (let img of product.productImg) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // Delete product from MongoDB
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const {
      productName,
      productDesc,
      productPrice,
      category,
      brand,
      existingImages,
    } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ⭐ default = purani images
    let updatedImages = product.productImg;

    // 🔹 agar existingImages aaye (user ne kuch remove ki)
    if (existingImages) {
      const keepIds = JSON.parse(existingImages);

      updatedImages = product.productImg.filter((img) =>
        keepIds.includes(img.public_id)
      );

      // delete removed images
      const removedImages = product.productImg.filter(
        (img) => !keepIds.includes(img.public_id)
      );

      for (let img of removedImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // 🔹 agar new images upload hui
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const fileUri = getDataUri(file);

        const result = await cloudinary.uploader.upload(fileUri, {
          folder: "mern_products",
        });

        updatedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    // 🔹 update fields
    product.productName = productName || product.productName;
    product.productDesc = productDesc || product.productDesc;
    product.productPrice = productPrice || product.productPrice;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.productImg = updatedImages;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




