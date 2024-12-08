import { productModel } from "../models/productModel.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/features.js";

export const getAllProductsController = async (req, res) => {
  const { keyword, category } = req.query;
  try {
    const products = await productModel
      .find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
        // category: category ? category : undefined,
      })
      .populate("category");
    res.status(200).send({
      success: true,
      message: "all products fetched successfully",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error getting all products",
      error,
    });
  }
};

// top product get
export const topProductGetController = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(3);
    res.status(200).send({
      success: true,
      message: "top 3 products",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error getting top products",
      error,
    });
  }
};

export const singleProductGetController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product with given id does not exist",
      });
    }

    res.status(200).send({
      success: true,
      message: "single product fetched successfully",
      product,
    });
  } catch (error) {
    console.log(error);

    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "error getting single product",
      error,
    });
  }
};

export const productCreateController = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    //validation
    if (!name || !description || !price || !stock) {
      res.status(500).send({
        success: false,
        message: "please enter all fields",
      });
    }

    if (!req.file) {
      return res.status(500).send({
        success: false,
        message: "please provide product images",
      });
    }
    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    await productModel.create({
      name,
      description,
      price,
      category,
      stock,
      images: [image],
    });
    //   .save();

    res.status(201).send({
      success: true,
      message: "product created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error creating product",
      error,
    });
  }
};

export const productUpdationController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, category, stock } = req.body;

    //validation and updation
    if (name) {
      product.name = name;
    }
    if (description) {
      product.description = description;
    }
    if (price) {
      product.price = price;
    }
    if (category) {
      product.category = category;
    }
    if (stock) {
      product.stock = stock;
    }

    await product.save();

    res.status(200).send({
      success: true,
      message: "product successsfully updated",
    });
  } catch (error) {
    console.log(error);

    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
        error,
      });
    }

    res.status(500).send({
      success: false,
      message: "error updating product",
      error,
    });
  }
};

export const productImagesUpdationController = async (req, res) => {
  try {
    // product find
    const product = await productModel.findById(req.params.id);

    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    //file check
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: "product image not found",
      });
    }

    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };

    //saving images
    product.images.push(image);
    await product.save();

    res.status(200).send({
      success: true,
      message: "product images updated successfully",
    });
  } catch (error) {
    console.log(error);

    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
        error,
      });
    }

    res.status(500).send({
      success: false,
      message: "error updating product images",
      error,
    });
  }
};

export const productImageDeleteController = async (req, res) => {
  try {
    //product find
    const product = await productModel.findById(req.params.id);

    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }

    //image id find
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "product image not found",
      });
    }

    let isExist = -1;

    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) {
        isExist = index;
      }
    });

    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image not found",
      });
    }

    // product image deletion
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    product.images.splice(isExist, 1);
    await product.save();

    return res.status(200).send({
      success: true,
      message: "product image deleted successfully",
    });
  } catch (error) {
    console.log(error);

    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
        error,
      });
    }

    res.status(500).send({
      success: false,
      message: "error deleting product image",
      error,
    });
  }
};

export const productDeleteController = async (req, res) => {
  try {
    //product find
    const product = await productModel.findById(req.params.id);

    //validation
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "product not found",
      });
    }

    //images find and deletion from cloudinary
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }
    await product.deleteOne();
    // await product.remove();

    res.status(200).send({
      success: true,
      message: "product deleted successfully",
    });
  } catch (error) {
    console.log(error);

    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
        error,
      });
    }

    res.status(500).send({
      success: false,
      message: "error deleting product image",
      error,
    });
  }
};

//product review and comment
export const productReviewController = async (req, res) => {
  try {
    const { comment, rating } = req.body;

    //product find
    const product = await productModel.findById(req.params.id);

    //checking user previous comment and review
    const pastUserReviews = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (pastUserReviews) {
      return res.status(400).send({
        success: false,
        message: "product already reviewed",
      });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      user: req.user._id,
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(200).send({
      success: true,
      message: "review added",
    });
  } catch (error) {
    console.log(error);

    //cast error || object id
    if (error.name === "CastError") {
      return res.status(500).send({
        success: false,
        message: "Invalid Id",
        error,
      });
    }

    res.status(500).send({
      success: false,
      message: "error in review comment api",
      error,
    });
  }
};
