const Progress = require('../models/progressModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

// Extract roleId (user profile ID) from JWT token
const getUserIdFromToken = (req) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    // Use roleId (profile ID) instead of userId (auth ID) for consistency
    return decoded.roleId || decoded.userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// GET all progress entries for a user
exports.getProgressController = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const progress = await Progress.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Error fetching progress' });
  }
};

// GET progress by plan filter
exports.getProgressByPlanController = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { plan } = req.query;
    const filter = { userId };
    if (plan) filter.plan = plan;

    const progress = await Progress.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    console.error('Error fetching progress by plan:', error);
    res.status(500).json({ success: false, message: 'Error fetching progress' });
  }
};

// POST create new progress entry
exports.createProgressController = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { plan, weight, waterIntake, calories, steps, goal, days, notes } = req.body;

    // Validate required fields
    if (!plan || !goal || !days) {
      return res.status(400).json({ success: false, message: 'Plan, goal, and days are required' });
    }

    // Validate plan is in enum
    const validPlans = [
      'weight-loss',
      'muscle-gain',
      'cardio',
      'hydration',
      'balanced-diet',
      'energy',
      'detox',
      'stamina',
      'maintenance',
      'flexibility',
      'recovery',
      'diabetes',
      'stress',
      'athletic',
      'general'
    ];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    // Validate days
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({ success: false, message: 'Days must be between 1-365' });
    }

    // Validate optional fields only if provided
    if (weight !== null && weight !== undefined) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
        return res.status(400).json({ success: false, message: 'Weight must be between 20-300 kg' });
      }
    }

    if (waterIntake !== null && waterIntake !== undefined) {
      const waterNum = parseFloat(waterIntake);
      if (isNaN(waterNum) || waterNum < 0 || waterNum > 10) {
        return res.status(400).json({ success: false, message: 'Water intake must be between 0-10 L' });
      }
    }

    if (calories !== null && calories !== undefined) {
      const caloriesNum = parseFloat(calories);
      if (isNaN(caloriesNum) || caloriesNum < 0 || caloriesNum > 5000) {
        return res.status(400).json({ success: false, message: 'Calories must be between 0-5000 kcal' });
      }
    }

    if (steps !== null && steps !== undefined) {
      const stepsNum = parseInt(steps);
      if (isNaN(stepsNum) || stepsNum < 0) {
        return res.status(400).json({ success: false, message: 'Steps must be a positive number' });
      }
    }

    const newProgress = new Progress({
      userId,
      plan,
      weight: weight || null,
      waterIntake: waterIntake || null,
      calories: calories || null,
      steps: steps || null,
      goal,
      days: daysNum,
      notes: notes || ''
    });

    await newProgress.save();
    res.status(201).json({ success: true, message: 'Progress entry created', entry: newProgress });
  } catch (error) {
    console.error('Error creating progress:', error);
    res.status(500).json({ success: false, message: 'Error creating progress entry' });
  }
};

// DELETE progress entry
exports.deleteProgressController = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const progress = await Progress.findByIdAndDelete(id);

    if (!progress || progress.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Progress entry not found' });
    }

    res.status(200).json({ success: true, message: 'Progress entry deleted' });
  } catch (error) {
    console.error('Error deleting progress:', error);
    res.status(500).json({ success: false, message: 'Error deleting progress' });
  }
};

// GET stats for a specific plan
exports.getPlanStatsController = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { plan } = req.query;
    const progress = await Progress.find({ userId, plan }).sort({ createdAt: -1 });

    if (progress.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: {
          totalEntries: 0,
          avgWeight: 0,
          totalWater: 0,
          avgCalories: 0,
          totalSteps: 0
        }
      });
    }

    const stats = {
      totalEntries: progress.length,
      avgWeight: (progress.reduce((sum, p) => sum + p.weight, 0) / progress.length).toFixed(1),
      totalWater: progress.reduce((sum, p) => sum + p.waterIntake, 0).toFixed(1),
      avgCalories: progress.filter(p => p.calories).length > 0 
        ? (progress.filter(p => p.calories).reduce((sum, p) => sum + p.calories, 0) / progress.filter(p => p.calories).length).toFixed(0)
        : 0,
      totalSteps: progress.filter(p => p.steps).reduce((sum, p) => sum + (p.steps || 0), 0)
    };

    res.status(200).json({ success: true, data: stats, entries: progress });
  } catch (error) {
    console.error('Error fetching plan stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
};
