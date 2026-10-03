const prisma = require('../prisma');

const createProduct = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can create products' });
  }

  const { title, description, price, quantity, category, tags, materials } = req.body;

  if (!title || !description || price === undefined || quantity === undefined || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        category,
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        materials: materials ? (Array.isArray(materials) ? materials : JSON.parse(materials)) : [],
        imageUrl: req.file ? req.file.path : null,
        artisanId: artisan.id,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyProducts = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can view their products via this endpoint' });
  }

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    const products = await prisma.product.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can update products' });
  }

  const { id } = req.params;
  const { title, description, price, quantity, category, tags, materials } = req.body;

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.artisanId !== artisan.id) {
      return res.status(403).json({ error: 'You do not have permission to edit this product' });
    }

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (quantity !== undefined) dataToUpdate.quantity = parseInt(quantity, 10);
    if (category) dataToUpdate.category = category;
    if (tags) dataToUpdate.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (materials) dataToUpdate.materials = Array.isArray(materials) ? materials : JSON.parse(materials);
    if (req.file) dataToUpdate.imageUrl = req.file.path;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can delete products' });
  }

  const { id } = req.params;

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.artisanId !== artisan.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this product' });
    }

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        artisan: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    const formattedProducts = products.map((p) => ({
      ...p,
      artisanName: p.artisan?.user?.name,
      location: p.artisan?.location,
      state: p.artisan?.state,
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        artisan: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const formattedProduct = {
      ...product,
      artisanName: product.artisan?.user?.name,
      location: product.artisan?.location,
      state: product.artisan?.state,
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
};
