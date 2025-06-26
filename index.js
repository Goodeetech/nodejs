const express = require("express");

const app = express();

app.use(express.json());

const products = [
  {
    id: 1,
    title: "Product 1",
  },
  {
    id: 2,
    title: "Product 2",
  },
  {
    id: 3,
    title: "Product 3",
  },
  {
    id: 4,
    title: "Product 4",
  },
];

app.get("/", (req, res) => {
  res.send("Hello homepage");
});

app.get("/products", (req, res) => {
  res.json(products);
});

app.get("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).send("Product not found");
  }
});

app.post("/add", (req, res) => {
  const newProduct = {
    id: products.length + 1,
    title: `Product ${products.length + 1}`,
  };

  products.push(newProduct);

  res.status(200).json({
    data: newProduct,
    message: "New product added successfully",
  });
});

app.put("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id, 10);

  const currentProduct = products.find((p) => p.id === productId);

  if (currentProduct) {
    currentProduct.title = req.body.title || currentProduct.title;
    res.json({
      message: "Product updated successfully",
      data: currentProduct,
    });
  } else {
    return res.status(404).send("Product not found");
  }
});

app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const currentProductIndex = products.findIndex((p) => p.id === productId);

  if (currentProductIndex !== -1) {
    const deletedProduct = products.splice(currentProductIndex, 1);
    res.status(200).json({
      message: "Product deleted successfully",
      data: deletedProduct[0],
    });
  } else {
    res.status(404).send("Product not found");
  }
});

const port = 3000;
app.listen(3000, () => {
  console.log(`Server listening on port ${port}`);
});
