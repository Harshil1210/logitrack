import productModel from "../models/product.model";

const sampleProducts = [
  {
    name: "Wireless Mouse",
    description: "Smooth, ergonomic wireless mouse with 3 adjustable DPI levels.",
    price: 599,
    stock: 25,
    category: "Electronics",
    imageUrl: "https://via.placeholder.com/150x100?text=Mouse",
  },
  {
    name: "Laptop Stand",
    description: "Aluminum adjustable laptop stand for better posture.",
    price: 1299,
    stock: 40,
    category: "Accessories",
    imageUrl: "https://via.placeholder.com/150x100?text=Laptop+Stand",
  },
  {
    name: "Bluetooth Headphones",
    description: "Noise-cancelling over-ear Bluetooth headphones.",
    price: 2499,
    stock: 18,
    category: "Audio",
    imageUrl: "https://via.placeholder.com/150x100?text=Headphones",
  },
  {
    name: "Smart LED Bulb",
    description: "Wi-Fi enabled smart bulb with app & voice control.",
    price: 399,
    stock: 50,
    category: "Smart Home",
    imageUrl: "https://via.placeholder.com/150x100?text=LED+Bulb",
  },
];

const seedProducts = async () => {
  try {

    await productModel.deleteMany(); // optional: clears old data
    await productModel.insertMany(sampleProducts);

    console.log("🌱 Products seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed products:", err);
    process.exit(1);
  }
};

seedProducts();