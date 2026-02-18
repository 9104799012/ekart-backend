import { Order } from "../models/ordermodel.js";
import { Product } from "../models/productmodel.js";
import Cart from "../models/cartmodel.js";
import { User } from "../models/usermodel.js";


export const createOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { products, amount, tax, shipping } = req.body;

    // ✅ Safety checks
    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products are required",
      });
    }

    const order = await Order.create({
      user: userId,
      products: products.map((item) => ({
        productId: item.productId,   // ✅ EXACT schema key
        quantity: item.quantity,
      })),
      amount,     // ✅ EXACT schema key
      tax,
      shipping,
    });

    res.status(201).json({
      success: true,
      cart: await Cart.findOneAndDelete({ userId }),
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMyOrder = async (req, res) => {
  try {
    const userId = req.id;

    const orders = await Order.find({ user: userId })
      .populate({
        path: "products.productId",
        select: "productName productPrice productImg",
      })
      .populate("user", "firstName lastName email");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// export const getUserOrders = async (req, res) => {
//   try {
//     const { userId } = req.params; // userId will come from URL

//     const orders = await Order.find({ user: userId })
//       .populate({
//         path: "products.productId",
//         select: "productName productPrice productImg",
//       }) // fetch product details
//       .populate("user", "firstName lastName email"); // fetch user info

//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders,
//     });
//   } catch (error) {
//     console.log("Error fetching user order:", error);
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    
   
     const orders = await Order.find({ user: userId })
      .populate("products.productId", "productName productPrice productImg")
      .populate("user", "firstName lastName email");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email") // populate user info
      .populate("products.productId", "productName productPrice"); // populate product info

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all orders",
      error: error.message,
    });
  }
};



export const getSalesData = async (req, res) => {
  try {
    // =============================
    // COUNTS
    // =============================
    const totalUsers = await User.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({ status: "Paid" });

    // =============================
    // TOTAL SALES AMOUNT
    // =============================
    const totalSaleAgg = await Order.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalSales =
      totalSaleAgg.length > 0 ? totalSaleAgg[0].total : 0;

    // =============================
    // SALES BY DATE (LAST 30 DAYS)
    // =============================
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDate = await Order.aggregate([
      {
        $match: {
          status: "Paid",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // =============================
    // FORMAT RESPONSE FOR FRONTEND
    // =============================
    const formattedSales = salesByDate.map((item) => ({
      date: item._id,
      amount: item.amount,
    }));

    // =============================
    // FINAL RESPONSE
    // =============================
    res.json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
      sales: formattedSales,
    });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




