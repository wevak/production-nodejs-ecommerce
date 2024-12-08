import { categoryModel } from "../models/categoryModel.js";
import { productModel } from "../models/productModel.js";

export const categoryCreateController = async (req, res) => {
  try {
    const { category } = req.body;

    //validation
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "please provide category name",
      });
    }

    await categoryModel.create({ category });
    res.status(201).send({
      success: true,
      message: `${category} category created successfully`,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "error creating product category",
    });
  }
};

export const categoryAllGetController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});

    res.status(200).send({
      success: true,
      message: "all categories fetched successfully",
      total_categories: categories.length,
      categories,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "error getting product categories",
    });
  }
};

export const categoryDeleteController = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "category not found",
      });
    }

    //product find with the category id
    const products = await productModel.find({ category: category._id });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }

    //category save
    // await category.save();
    await category.deleteOne();

    res.status(200).send({
      success: true,
      message: "category deleted successfully",
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
      message: "error deleting category api",
      error,
    });
  }
};

export const categoryUpdateController = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "category not found",
      });
    }

    //updated category
    const { updatedCategory } = req.body;

    //product find with the category id
    const products = await productModel.find({ category: category._id });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = updatedCategory;
      await product.save();
    }

    //updated category save
    if (updatedCategory) {
      category.category = updatedCategory;
    }
    await category.save();

    res.status(200).send({
      success: true,
      message: "category updated successfully",
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
      message: "error updating category",
      error,
    });
  }
};
