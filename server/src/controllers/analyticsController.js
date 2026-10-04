const prisma = require('../prisma');

const recordProductView = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const metric = await prisma.productMetric.upsert({
      where: { productId },
      update: { views: { increment: 1 } },
      create: { productId, views: 1 },
    });

    res.json({ success: true, views: metric.views });
  } catch (error) {
    console.error('Record product view error:', error);
    res.status(500).json({ error: 'Failed to record view metric' });
  }
};

const getProductMetrics = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        metric: true,
        orderItems: { select: { quantity: true, price: true } },
      },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const metric = product.metric || { views: 0, cartAdditions: 0, orders: 0, revenue: 0 };

    res.json({
      productId,
      title: product.title,
      views: metric.views,
      cartAdditions: metric.cartAdditions,
      orders: metric.orders,
      revenue: metric.revenue,
      conversionRate: metric.views > 0 ? ((metric.orders / metric.views) * 100).toFixed(1) + '%' : '0%',
    });
  } catch (error) {
    console.error('Get product metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};

const getArtisanAnalytics = async (req, res) => {
  if (req.user.role !== 'ARTISAN') {
    return res.status(403).json({ error: 'Only artisans can access artisan analytics' });
  }

  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.user.id } });
    if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

    // Aggregate products
    const totalProducts = await prisma.product.count({ where: { artisanId: artisan.id } });
    
    // Aggregate order items for this artisan
    const orderItems = await prisma.orderItem.findMany({
      where: { artisanId: artisan.id },
      include: { order: { select: { status: true, createdAt: true } } },
    });

    const totalOrders = orderItems.length;
    const totalRevenue = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Aggregate product metrics
    const metrics = await prisma.productMetric.findMany({
      where: { product: { artisanId: artisan.id } },
    });

    const totalViews = metrics.reduce((sum, m) => sum + m.views, 0);
    const totalCartAdds = metrics.reduce((sum, m) => sum + m.cartAdditions, 0);

    // Active growth contracts
    const activeContract = await prisma.contract.findFirst({
      where: { artisanId: artisan.id, status: 'ACTIVE' },
      include: {
        intern: { include: { user: { select: { name: true, phone: true } } } },
        tasks: true,
      },
    });

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      totalViews,
      totalCartAdds,
      activeContract: activeContract
        ? {
            id: activeContract.id,
            title: activeContract.title,
            growthManagerName: activeContract.intern?.user?.name,
            tier: activeContract.tier,
            tasksTotal: activeContract.tasks.length,
            tasksCompleted: activeContract.tasks.filter((t) => t.isCompleted).length,
          }
        : null,
    });
  } catch (error) {
    console.error('Get artisan analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

const getInternGrowthView = async (req, res) => {
  const { clientId } = req.params; // artisanId

  try {
    const artisan = await prisma.artisan.findUnique({
      where: { id: clientId },
      include: { user: { select: { name: true } } },
    });

    if (!artisan) return res.status(404).json({ error: 'Artisan not found' });

    const contract = await prisma.contract.findFirst({
      where: { artisanId: clientId, intern: { userId: req.user.id } },
      include: { tasks: true },
    });

    const products = await prisma.product.findMany({
      where: { artisanId: clientId },
      include: { metric: true },
    });

    const totalViews = products.reduce((acc, p) => acc + (p.metric?.views || 0), 0);
    const totalOrders = products.reduce((acc, p) => acc + (p.metric?.orders || 0), 0);

    res.json({
      artisanName: artisan.user.name,
      totalProducts: products.length,
      totalViews,
      totalOrders,
      tasksCompleted: contract ? contract.tasks.filter((t) => t.isCompleted).length : 0,
      tasksTotal: contract ? contract.tasks.length : 0,
    });
  } catch (error) {
    console.error('Get intern growth view error:', error);
    res.status(500).json({ error: 'Failed to fetch client growth metrics' });
  }
};

module.exports = {
  recordProductView,
  getProductMetrics,
  getArtisanAnalytics,
  getInternGrowthView,
};
