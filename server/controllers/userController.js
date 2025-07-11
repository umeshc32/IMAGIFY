import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import razorpay from 'razorpay'
import transactionModel from "../models/transactionModel.js";




export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      success: true,
      user: { name: savedUser.name },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      success: true,
      user: { name: user.name },
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const userCredits = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Safe even if there's no body

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      credit: user.creditBalance,
      user: { name: user.name }
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};



const paymentRazorpay = async (req, res) => {
  try {
    const razorpayInstance = new razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const planId = req.body.planId;
    const userId = req.userId; // ✅ comes from middleware

    if (!userId || !planId) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    const userData = await userModel.findById(userId);

    let credits, plan, amount, date;

    switch (planId) {
      case 'Basic':
        plan = 'Basic';
        amount = 10;
        credits = 100;
        break;
      case 'Advanced':
        plan = 'Advanced';
        amount = 50;
        credits = 500;
        break;
      case 'Business':
        plan = 'Business';
        amount = 250;
        credits = 1000;
        break;
      default:
        return res.json({ success: false, message: 'Plan not found' });
    }

    date = Date.now();

    const transactionData = {
      userId,
      plan,
      amount,
      credits,
      date
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY,
      receipt: newTransaction._id.toString(),
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorPay = async (req, res) => {
  try {
    const razorpayInstance = new razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });


    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

    if (orderInfo.status == 'paid') {
      const transactionData = await transactionModel.findById(orderInfo.receipt)

      if (transactionData.payment) {
        return res.json({ success: false, message: 'Payment Failed' })
      }

      const userData = await userModel.findById(transactionData.userId)

      const creditBalance = userData.creditBalance + transactionData.credits;
      await userModel.findByIdAndUpdate(userData._id, { creditBalance })

      await transactionModel.findByIdAndUpdate(transactionData._id, { payment: true })

      res.json({ sucess: true, message: "Credits Added" })
    } else {
      res.json({ sucess: false, message: "Credits Failed" })
    }



  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export { userCredits, paymentRazorpay, verifyRazorPay };

