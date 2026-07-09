import Menu from '../models/Menu.js';

/**
 * @desc    Get menu by date
 * @route   GET /api/menu?date=YYYY-MM-DD
 * @access  Public
 */
export const getMenuByDate = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date query parameter is required (YYYY-MM-DD).',
      });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const menus = await Menu.find({
      date: { $gte: targetDate, $lt: nextDay },
      isPublished: true,
    }).populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get weekly menu (next 7 days)
 * @route   GET /api/menu/weekly
 * @access  Public
 */
export const getWeeklyMenu = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    const menus = await Menu.find({
      date: { $gte: today, $lte: weekEnd },
      isPublished: true,
    })
      .sort({ date: 1, mealType: 1 })
      .populate('createdBy', 'name');

    // Group by date for convenience
    const grouped = {};
    for (const menu of menus) {
      const dateKey = menu.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(menu);
    }

    res.status(200).json({
      success: true,
      count: menus.length,
      data: menus,
      grouped,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a menu for a date
 * @route   POST /api/menu
 * @access  Admin
 */
export const createMenu = async (req, res, next) => {
  try {
    const { date, mealType, items, price } = req.body;

    if (!date || !mealType || !items || !price) {
      return res.status(400).json({
        success: false,
        message: 'Date, mealType, items, and price are required.',
      });
    }

    const menuDate = new Date(date);
    menuDate.setHours(0, 0, 0, 0);

    const menu = await Menu.create({
      date: menuDate,
      mealType,
      items,
      price,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a menu
 * @route   PUT /api/menu/:id
 * @access  Admin
 */
export const updateMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedFields = ['items', 'price', 'mealType', 'date'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.date) {
      const d = new Date(updateData.date);
      d.setHours(0, 0, 0, 0);
      updateData.date = d;
    }

    const menu = await Menu.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a menu
 * @route   DELETE /api/menu/:id
 * @access  Admin
 */
export const deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish a menu
 * @route   PATCH /api/menu/:id/publish
 * @access  Admin
 */
export const publishMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByIdAndUpdate(
      id,
      { isPublished: true },
      { new: true }
    );

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Menu published successfully.',
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};
