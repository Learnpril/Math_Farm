import { query } from './connection.js';

// Seed data for forum categories based on Math Farm curriculum
export const forumCategories = [
  // Main curriculum categories
  {
    name: 'Elementary Mathematics',
    description: 'Basic arithmetic, fractions, and foundational concepts',
    parentId: null,
    sortOrder: 1,
  },
  {
    name: 'Middle School Mathematics',
    description: 'Pre-algebra, geometry, and intermediate concepts',
    parentId: null,
    sortOrder: 2,
  },
  {
    name: 'High School Mathematics',
    description: 'Algebra, advanced geometry, and pre-calculus',
    parentId: null,
    sortOrder: 3,
  },
  {
    name: 'Advanced Mathematics',
    description: 'Calculus, statistics, and higher-level mathematics',
    parentId: null,
    sortOrder: 4,
  },
  {
    name: 'Specialized Topics',
    description: 'Game design math, data science, and applied mathematics',
    parentId: null,
    sortOrder: 5,
  },

  // Elementary subcategories
  {
    name: 'Basic Arithmetic',
    description: 'Addition, subtraction, multiplication, division',
    parentId: 1, // Elementary Mathematics
    sortOrder: 1,
  },
  {
    name: 'Fractions & Decimals',
    description: 'Working with fractions, decimals, and percentages',
    parentId: 1,
    sortOrder: 2,
  },
  {
    name: 'Basic Geometry',
    description: 'Shapes, measurements, and spatial concepts',
    parentId: 1,
    sortOrder: 3,
  },

  // Middle School subcategories
  {
    name: 'Pre-Algebra',
    description: 'Introduction to algebraic thinking and equations',
    parentId: 2, // Middle School Mathematics
    sortOrder: 1,
  },
  {
    name: 'Integers & Rationals',
    description: 'Working with negative numbers and rational numbers',
    parentId: 2,
    sortOrder: 2,
  },
  {
    name: 'Ratios & Proportions',
    description: 'Understanding relationships between quantities',
    parentId: 2,
    sortOrder: 3,
  },

  // High School subcategories
  {
    name: 'Algebra I',
    description: 'Linear equations, inequalities, and functions',
    parentId: 3, // High School Mathematics
    sortOrder: 1,
  },
  {
    name: 'Geometry',
    description: 'Proofs, trigonometry, and geometric relationships',
    parentId: 3,
    sortOrder: 2,
  },
  {
    name: 'Algebra II',
    description: 'Quadratic functions, polynomials, and exponentials',
    parentId: 3,
    sortOrder: 3,
  },
  {
    name: 'Pre-Calculus',
    description: 'Advanced functions and preparation for calculus',
    parentId: 3,
    sortOrder: 4,
  },

  // Advanced subcategories
  {
    name: 'Calculus',
    description: 'Derivatives, integrals, and limits',
    parentId: 4, // Advanced Mathematics
    sortOrder: 1,
  },
  {
    name: 'Statistics',
    description: 'Data analysis, probability, and statistical inference',
    parentId: 4,
    sortOrder: 2,
  },
  {
    name: 'Linear Algebra',
    description: 'Matrices, vectors, and linear transformations',
    parentId: 4,
    sortOrder: 3,
  },
  {
    name: 'Differential Equations',
    description: 'Solving equations involving derivatives',
    parentId: 4,
    sortOrder: 4,
  },

  // Specialized subcategories
  {
    name: 'Game Design Mathematics',
    description: 'Vectors, physics simulations, and game algorithms',
    parentId: 5, // Specialized Topics
    sortOrder: 1,
  },
  {
    name: 'LaTeX & Mathematical Typesetting',
    description: 'Creating beautiful mathematical documents',
    parentId: 5,
    sortOrder: 2,
  },
  {
    name: 'MATLAB & Scientific Computing',
    description: 'Numerical methods and computational mathematics',
    parentId: 5,
    sortOrder: 3,
  },
  {
    name: 'Data Science & Machine Learning',
    description: 'Applied statistics and mathematical modeling',
    parentId: 5,
    sortOrder: 4,
  },

  // General discussion categories
  {
    name: 'General Discussion',
    description: 'General math discussions and questions',
    parentId: null,
    sortOrder: 6,
  },
  {
    name: 'Study Groups',
    description: 'Organize and join study groups',
    parentId: null,
    sortOrder: 7,
  },
  {
    name: 'Math Tools & Resources',
    description: 'Discuss calculators, software, and learning resources',
    parentId: null,
    sortOrder: 8,
  },
  {
    name: 'Site Feedback',
    description: 'Suggestions and feedback about Math Farm',
    parentId: null,
    sortOrder: 9,
  },
];

// Default avatar items for the chibi avatar system
export const defaultAvatarItems = [
  // Background items
  {
    id: 'bg_chalkboard',
    name: 'Chalkboard',
    category: 'background',
    svgPath: '/assets/avatars/backgrounds/chalkboard.svg',
    unlockCondition: { type: 'posts', threshold: 0 },
    zIndex: 0,
  },
  {
    id: 'bg_notebook',
    name: 'Notebook Paper',
    category: 'background',
    svgPath: '/assets/avatars/backgrounds/notebook.svg',
    unlockCondition: { type: 'posts', threshold: 5 },
    zIndex: 0,
  },

  // Body items
  {
    id: 'body_default',
    name: 'Default Body',
    category: 'body',
    svgPath: '/assets/avatars/bodies/default.svg',
    unlockCondition: { type: 'posts', threshold: 0 },
    zIndex: 1,
  },

  // Clothing items
  {
    id: 'shirt_math_formula',
    name: 'Formula T-Shirt',
    category: 'clothing',
    svgPath: '/assets/avatars/clothing/formula-shirt.svg',
    unlockCondition: { type: 'posts', threshold: 0 },
    zIndex: 2,
  },
  {
    id: 'shirt_pi',
    name: 'Pi Symbol Shirt',
    category: 'clothing',
    svgPath: '/assets/avatars/clothing/pi-shirt.svg',
    unlockCondition: { type: 'posts', threshold: 10 },
    zIndex: 2,
  },

  // Math tool accessories
  {
    id: 'acc_calculator',
    name: 'Calculator',
    category: 'math-tools',
    svgPath: '/assets/avatars/accessories/calculator.svg',
    unlockCondition: { type: 'posts', threshold: 1 },
    zIndex: 3,
  },
  {
    id: 'acc_protractor',
    name: 'Protractor',
    category: 'math-tools',
    svgPath: '/assets/avatars/accessories/protractor.svg',
    unlockCondition: { type: 'posts', threshold: 5 },
    zIndex: 3,
  },
  {
    id: 'acc_compass',
    name: 'Compass',
    category: 'math-tools',
    svgPath: '/assets/avatars/accessories/compass.svg',
    unlockCondition: { type: 'posts', threshold: 15 },
    zIndex: 3,
  },
];

// Function to seed forum categories
export async function seedForumCategories(): Promise<void> {
  try {
    console.log('🌱 Seeding forum categories...');

    // Check if categories already exist
    const existingCategories = await query(
      'SELECT COUNT(*) as count FROM forum_categories'
    );

    if (existingCategories[0]?.count > 0) {
      console.log('📋 Forum categories already exist, skipping seed');
      return;
    }

    // Insert categories in order (parents first)
    for (const category of forumCategories) {
      await query(
        `INSERT INTO forum_categories (name, description, parent_id, sort_order) 
         VALUES (?, ?, ?, ?)`,
        [
          category.name,
          category.description,
          category.parentId,
          category.sortOrder,
        ]
      );
    }

    console.log(`✅ Seeded ${forumCategories.length} forum categories`);
  } catch (error) {
    console.error('❌ Error seeding forum categories:', error);
    throw error;
  }
}

// Function to seed default avatar items
export async function seedAvatarItems(): Promise<void> {
  try {
    console.log('🎨 Seeding default avatar items...');

    // Create avatar_items table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS avatar_items (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category ENUM('background', 'body', 'clothing', 'accessories', 'math-tools') NOT NULL,
        svg_path VARCHAR(500) NOT NULL,
        unlock_type ENUM('posts', 'likes', 'tenure', 'achievement') NOT NULL,
        unlock_threshold INT NOT NULL,
        z_index INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_category (category),
        INDEX idx_unlock (unlock_type, unlock_threshold)
      )
    `);

    // Check if items already exist
    const existingItems = await query(
      'SELECT COUNT(*) as count FROM avatar_items'
    );

    if (existingItems[0]?.count > 0) {
      console.log('🎨 Avatar items already exist, skipping seed');
      return;
    }

    // Insert avatar items
    for (const item of defaultAvatarItems) {
      await query(
        `INSERT INTO avatar_items (id, name, category, svg_path, unlock_type, unlock_threshold, z_index) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.name,
          item.category,
          item.svgPath,
          item.unlockCondition.type,
          item.unlockCondition.threshold,
          item.zIndex,
        ]
      );
    }

    console.log(`✅ Seeded ${defaultAvatarItems.length} avatar items`);
  } catch (error) {
    console.error('❌ Error seeding avatar items:', error);
    throw error;
  }
}

// Function to run all seed operations
export async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');

    await seedForumCategories();
    await seedAvatarItems();

    console.log('✅ Database seeding completed successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}
