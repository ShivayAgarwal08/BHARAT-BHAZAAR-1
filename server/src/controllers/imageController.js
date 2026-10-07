const prisma = require('../prisma');

const getImage = async (req, res) => {
  try {
    // The id param might include .webp extension, so strip it out.
    const filename = req.params.id;
    const id = filename.split('.')[0];

    const image = await prisma.imageRecord.findUnique({
      where: { id }
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Set caching headers for persistent images
    res.setHeader('Content-Type', image.mimetype);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Send the binary data
    res.send(image.data);
  } catch (error) {
    console.error('Image retrieval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getImage
};
