const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello homepage");
});

app.get("/products", (req, res) => {
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
  res.json(products);
});

app.get("/products/:id", (req, res) => {
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

  const productId = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).send("Product not found");
  }
});

const port = 3000;
app.listen(3000, () => {
  console.log(`Server listening on port ${port}`);
});
