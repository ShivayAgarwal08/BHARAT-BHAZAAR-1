const prisma = require('../prisma');

const createOrder = async (req, res) => {
  const { shippingAddress, phone, customerName } = req.body;

  if (!shippingAddress || !phone) {
    return res.status(400).json({ error: 'Shipping address and phone number are required' });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // Verify stock availability for all items
    for (const item of cart.items) {
      if (item.product.quantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${item.product.title}". Only ${item.product.quantity} left in stock.`,
        });
      }
    }

    // Compute total amount
    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    // Execute order creation & stock reduction in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId: req.user.id,
          totalAmount,
          shippingAddress,
          phone,
          customerName: customerName || req.user.name,
          status: 'PENDING',
          paymentStatus: 'UNPAID', // Clear MVP marker: offline/COD order placement
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              artisanId: item.product.artisanId,
              title: item.product.title,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement product inventory and record order metrics
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.productMetric.upsert({
          where: { productId: item.productId },
          update: {
            orders: { increment: item.quantity },
            revenue: { increment: item.product.price * item.quantity },
          },
          create: {
            productId: item.productId,
            orders: item.quantity,
            revenue: item.product.price * item.quantity,
          },
        });
      }

      // Clear the user's cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { imageUrl: true, category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true, email: true } },
        items: {
          include: {
            product: { select: { imageUrl: true, category: true } },
            artisan: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization: customer who placed order OR artisan owning an item in order
    const isCustomer = order.customerId === req.user.id;
    let isItemArtisan = false;

    if (req.user.role === 'ARTISAN') {
      const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
      if (artisan) {
        isItemArtisan = order.items.some((item) => item.artisanId === artisan.id);
      }
    }

    if (!isCustomer && !isItemArtisan && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

const getArtisanOrders = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can view artisan orders' });
  }

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    // Find all order items matching this artisan's ID
    const orderItems = await prisma.orderItem.findMany({
      where: { artisanId: artisan.id },
      include: {
        order: {
          include: {
            customer: { select: { name: true, phone: true } },
          },
        },
        product: { select: { imageUrl: true } },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    res.json(orderItems);
  } catch (error) {
    console.error('Get artisan orders error:', error);
    res.status(500).json({ error: 'Failed to fetch artisan orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  if (req.user.role !== 'ARTISAN' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role === 'ARTISAN') {
      const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
      const ownsAnyItem = order.items.some((item) => item.artisanId === artisan.id);
      if (!ownsAnyItem) {
        return res.status(403).json({ error: 'Unauthorized to update status for this order' });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getArtisanOrders,
  updateOrderStatus,
};
