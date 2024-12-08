import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "category is required"],
    },
  },
  { timestamps: true }
);

export const categoryModel = mongoose.model("Category", categorySchema);
