import axios from "axios";
import userModel from "../models/userModel.js";
import FormData from "form-data";

const generateImage = async (req, res) => {
  try {
    // ✅ Use userId from req.userId (set by JWT middleware)
    const userId = req.userId;
    const { prompt } = req.body;

    // ✅ Check both values
    if (!userId || !prompt) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // ✅ Fetch user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // ✅ Credit balance check
    if (user.creditBalance <= 0) {
      return res.json({
        success: false,
        message: "No Credit Balance",
        creditBalance: user.creditBalance,
      });
    }

    // ✅ Prepare image generation request
    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(), // ✅ Required when using form-data
          "x-api-key": process.env.CLIPDROP_API,
        },
        responseType: "arraybuffer", // ✅ Get raw binary data
      }
    );

    // ✅ Convert image to base64
    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    // ✅ Update credit balance
    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    // ✅ Respond with image + new balance
    res.json({
      success: true,
      message: "Image Generated",
      creditBalance: user.creditBalance - 1,
      resultImage,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { generateImage };
