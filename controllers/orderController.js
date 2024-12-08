import { orderModel } from "../models/orderModel.js";
import { productModel } from "../models/productModel.js";
import { stripe } from "../server.js";

export const orderCreateController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;

    //validation
    // if (
    //   !shippingInfo ||
    //   !orderItems ||
    //   !paymentMethod ||
    //   !paymentInfo ||
    //   !itemPrice ||
    //   !tax ||
    //   !shippingCharges ||
    //   !totalAmount
    // ) {
    //   return res.status(500).send({
    //     success: false,
    //     message: "all fields are required",
    //   });
    // }

    //order create
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemPrice,
      tax,
      shippingCharges,
      totalAmount,
    });

    //stock update
    for (let i = 0; i < orderItems.length; i++) {
      //product find
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }

    res.status(201).send({
      success: true,
      message: "order placed successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "error creating order",
      error,
    });
  }
};

//all orders get - my orders
export const myAllOrdersFetchController = async (req, res) => {
  try {
    // all orders find
    const orders = await orderModel.find({ user: req.user._id });

    //validation
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "orders not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "my all orders found successfully",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "error reading my orders",
      error,
    });
  }
};

export const getOneOrderController = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "order found successfully",
      order,
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
      message: "error getting single order",
      error,
    });
  }
};

export const paymentsAcceptController = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    //validation
    if (!totalAmount) {
      return res.status(404).send({
        success: false,
        message: "total amount is required",
      });
    }

    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount),
      currency: "usd",
    });

    res.status(200).send({
      success: true,
      client_secret,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "error getting single order",
      error,
    });
  }
};

// ----------admin section------------
//all orders get
export const allOrdersGetController = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    // validation
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "orders not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "all orders get successfully",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "error getting all orders",
      error,
    });
  }
};

export const orderStatusUpdateController = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "order not found",
      });
    }

    if (order.orderStatus === "processing") {
      order.orderStatus = "shipped";
    } else if (order.orderStatus === "shipped") {
      order.orderStatus = "delivered";
      order.deliveredAt = Date.now();
    } else {
      return res.status(500).send({
        success: false,
        message: "order already delivered",
      });
    }
    await order.save();

    res.status(200).send({
      success: true,
      message: "order status updated successfully",
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
      message: "error getting all orders",
      error,
    });
  }
};
