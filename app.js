// const express = require("express");

// const app = express();

// app.use(express.json());

// const products = [
//   {
//     id: 1,
//     title: "Product 1",
//   },
//   {
//     id: 2,
//     title: "Product 2",
//   },
//   {
//     id: 3,
//     title: "Product 3",
//   },
//   {
//     id: 4,
//     title: "Product 4",
//   },
// ];

// app.get("/", (req, res) => {
//   res.send("Hello homepage");
// });

// app.get("/products", (req, res) => {
//   res.json(products);
// });

// app.get("/products/:id", (req, res) => {
//   const productId = parseInt(req.params.id, 10);
//   const product = products.find((p) => p.id === productId);

//   if (product) {
//     res.json(product);
//   } else {
//     res.status(404).send("Product not found");
//   }
// });

// app.post("/add", (req, res) => {
//   const newProduct = {
//     id: products.length + 1,
//     title: `Product ${products.length + 1}`,
//   };

//   products.push(newProduct);

//   res.status(200).json({
//     data: newProduct,
//     message: "New product added successfully",
//   });
// });

// app.put("/products/:id", (req, res) => {
//   const productId = parseInt(req.params.id, 10);

//   const currentProduct = products.find((p) => p.id === productId);

//   if (currentProduct) {
//     currentProduct.title = req.body.title || currentProduct.title;
//     res.json({
//       message: "Product updated successfully",
//       data: currentProduct,
//     });
//   } else {
//     return res.status(404).send("Product not found");
//   }
// });

// app.delete("/products/:id", (req, res) => {
//   const productId = parseInt(req.params.id, 10);
//   const currentProductIndex = products.findIndex((p) => p.id === productId);

//   if (currentProductIndex !== -1) {
//     const deletedProduct = products.splice(currentProductIndex, 1);
//     res.status(200).json({
//       message: "Product deleted successfully",
//       data: deletedProduct[0],
//     });
//   } else {
//     res.status(404).send("Product not found");
//   }
// });

// const port = 3000;
// app.listen(3000, () => {
//   console.log(`Server listening on port ${port}`);
// });

const mongoose = require("mongoose");

mongoose
  .connect("mongodb+srv://ayomidegoodee:Goodee@cluster0.2kgrviw.mongodb.net/")
  .then(() => console.log("Connected to MongoDB database"));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  isActive: Boolean,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

const createUser = async () => {
  try {
    // const newUser = await User.create({
    //   name: "Updated User",
    //   email: "updatedUser@gmail.com",
    //   age: 98,
    //   isActive: true,
    //   tags: ["developer", "javascript", "nodejs"],
    //   createdAt: new Date(),
    // });

    // console.log("User created successfully:", newUser);

    // const allUsers = await User.find();
    // console.log("All users:", allUsers);

    // const userGoodee = await User.findOne({
    //   name: "Goodee",
    // });
    // console.log("Users with name with Goodee:", userGoodee);

    // const getLatestUserById = await User.findById(newUser._id);
    // console.log("Latest user by ID:", getLatestUserById);

    // const userSlectedFields = await User.find().select("name email -_id");
    // console.log("Users with selected fields (name, email):", userSlectedFields);

    // const LimitedUsers = await User.find().limit(3).skip(1);
    // console.log("Limited users (3, skip 1):", LimitedUsers);

    // const sortedUsers = await User.find().sort({
    //   age: -1, //sort by age in descending order
    // });
    // console.log("Sorted users by age (descending):", sortedUsers);

    // const countUsers = await User.countDocuments({ isActive: true });
    // console.log("Count of active users:", countUsers);

    // const deleteUser = await User.findByIdAndDelete(newUser._id);
    // console.log("User deleted successfully:", deleteUser);

    const updatedUser = await User.findByIdAndUpdate(
      "685d06a428213d03d53251c3",
      { $set: { age: 101, isActive: true } },
      { new: true }
    );
    console.log("User updated successfully:", updatedUser);
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    mongoose.connection.close();
  }
};

createUser().catch((error) => {
  console.error("Error in createUser function:", error);
  mongoose.connection.close();
});
