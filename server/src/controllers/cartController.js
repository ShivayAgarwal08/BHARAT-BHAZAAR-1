const prisma = require('../prisma');

const getCart = async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                artisan: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: { items: { include: { product: true } } },
      });
    }

    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity, 10) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: parseInt(quantity, 10),
        },
      });
    }

    // Record cart addition metric asynchronously
    await prisma.productMetric.upsert({
      where: { productId },
      update: { cartAdditions: { increment: parseInt(quantity, 10) } },
      create: { productId, cartAdditions: parseInt(quantity, 10) },
    }).catch(err => console.error('Metric update error:', err));

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                artisan: { include: { user: { select: { name: true } } } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

const updateCartQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 1) {
    return res.status(400).json({ error: 'Valid positive quantity required' });
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or cart item not found' });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity: parseInt(quantity, 10) },
      include: { product: true },
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update item quantity' });
  }
};

const removeFromCart = async (req, res) => {
  const { id } = req.params;

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id } });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
