/**
 * ============================================================================
 * SpendWise - Prisma Client Configuration
 * ============================================================================
 * This file manages the database client.
 *
 * - When integrated with PostgreSQL (DBMS member's schema):
 *   It exports an active instance of PrismaClient.
 *
 * - When in mock/development mode (USE_MOCK=true):
 *   It exports an in-memory mock client that mirrors standard Prisma methods
 *   (findMany, findUnique, findFirst, create, update, delete, count).
 *
 * This design ensures:
 * 1. The controllers use real, standard Prisma syntax.
 * 2. The frontend team can run and test all APIs right away without setting up PostgreSQL.
 * 3. The DBMS member can plug in their schema.prisma and migrations without changing any controller code.
 * ============================================================================
 */

const dotenv = require('dotenv');
dotenv.config();

const useMock = process.env.USE_MOCK === 'true';

let prisma;

if (!useMock) {
  // Real Prisma Client connection (for PostgreSQL database)
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    console.log('[Prisma] Connected using real Prisma Client.');
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Prisma Fatal] Failed to initialize Prisma Client in production:', error.message);
      throw error;
    }
    console.warn('[Prisma] Prisma Client is not yet generated or available.');
    console.warn('[Prisma] Falling back to temporary mock dataset.');
    prisma = createMockPrismaClient();
  }
} else {
  // Development mode: In-memory mock database
  console.log('[Database] Running in development mode with temporary mock dataset.');
  prisma = createMockPrismaClient();
}

/**
 * Creates an in-memory Prisma-compatible mock adapter.
 * Matches standard Prisma query syntax used in controllers.
 */
function createMockPrismaClient() {
  const mockData = require('../data/temporaryMockData');

  return {
    // Transaction model operations
    transaction: {
      async findMany(args = {}) {
        let results = [...mockData.transactions];

        // Apply where filters if provided
        if (args.where) {
          const { type, category, categoryId, date } = args.where;

          if (type) {
            results = results.filter(
              t => t.type.toLowerCase() === type.toLowerCase()
            );
          }

          if (category) {
            results = results.filter(
              t => t.category && t.category.toLowerCase() === category.toLowerCase()
            );
          }

          if (categoryId) {
            results = results.filter(
              t => Number(t.categoryId) === Number(categoryId)
            );
          }

          if (date) {
            if (date.gte && date.lte) {
              const start = new Date(date.gte).toISOString().slice(0, 10);
              const end = new Date(date.lte).toISOString().slice(0, 10);
              results = results.filter(t => t.date >= start && t.date <= end);
            } else if (date.gte) {
              const start = new Date(date.gte).toISOString().slice(0, 10);
              results = results.filter(t => t.date >= start);
            } else if (date.lte) {
              const end = new Date(date.lte).toISOString().slice(0, 10);
              results = results.filter(t => t.date <= end);
            }
          }
        }

        // Apply orderBy if provided (default descending by date)
        if (args.orderBy) {
          const field = Object.keys(args.orderBy)[0] || 'date';
          const direction = args.orderBy[field] || 'desc';

          results.sort((a, b) => {
            if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
            return 0;
          });
        } else {
          // Default: latest date first
          results.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return results;
      },

      async findUnique(args = {}) {
        const id = Number(args.where?.id);
        const item = mockData.transactions.find(t => t.id === id);
        return item || null;
      },

      async findFirst(args = {}) {
        const items = await this.findMany(args);
        return items[0] || null;
      },

      async create(args = {}) {
        let catId = args.data.categoryId ? Number(args.data.categoryId) : null;
        let catName = args.data.category || '';

        // Resolve missing categoryId or category name
        if (!catId && catName) {
          const found = mockData.categories.find(
            c => c.name.toLowerCase() === catName.toLowerCase()
          );
          if (found) {
            catId = found.id;
            catName = found.name;
          }
        } else if (catId && !catName) {
          const found = mockData.categories.find(c => c.id === catId);
          if (found) {
            catName = found.name;
          }
        }

        const newRecord = {
          id: mockData.getNextTransactionId(),
          title: args.data.title,
          amount: parseFloat(args.data.amount),
          type: args.data.type,
          categoryId: catId || 14,
          category: catName || 'Miscellaneous',
          date: args.data.date instanceof Date ? args.data.date.toISOString().slice(0, 10) : args.data.date,
          notes: args.data.notes || ''
        };
        mockData.transactions.push(newRecord);
        return newRecord;
      },

      async update(args = {}) {
        const id = Number(args.where?.id);
        const index = mockData.transactions.findIndex(t => t.id === id);
        if (index === -1) {
          throw new Error('Record to update not found.');
        }

        const current = mockData.transactions[index];
        let catId = args.data.categoryId !== undefined ? Number(args.data.categoryId) : current.categoryId;
        let catName = args.data.category !== undefined ? args.data.category : current.category;

        if (args.data.categoryId !== undefined && args.data.category === undefined) {
          const found = mockData.categories.find(c => c.id === catId);
          if (found) catName = found.name;
        } else if (args.data.category !== undefined && args.data.categoryId === undefined) {
          const found = mockData.categories.find(
            c => c.name.toLowerCase() === catName.toLowerCase()
          );
          if (found) catId = found.id;
        }

        const updated = {
          ...current,
          ...args.data,
          id: current.id, // preserve id
          categoryId: catId,
          category: catName,
          amount: args.data.amount !== undefined ? parseFloat(args.data.amount) : current.amount,
          date: args.data.date instanceof Date ? args.data.date.toISOString().slice(0, 10) : (args.data.date !== undefined ? args.data.date : current.date)
        };

        mockData.transactions[index] = updated;
        return updated;
      },

      async delete(args = {}) {
        const id = Number(args.where?.id);
        const index = mockData.transactions.findIndex(t => t.id === id);
        if (index === -1) {
          throw new Error('Record to delete not found.');
        }

        const [deleted] = mockData.transactions.splice(index, 1);
        return deleted;
      },

      async updateMany(args = {}) {
        let count = 0;
        if (args.where) {
          const { categoryId, category } = args.where;
          for (let i = 0; i < mockData.transactions.length; i++) {
            const tx = mockData.transactions[i];
            let match = false;
            if (categoryId !== undefined && Number(tx.categoryId) === Number(categoryId)) match = true;
            if (category !== undefined && tx.category && tx.category.toLowerCase() === category.toLowerCase()) match = true;
            if (match) {
              mockData.transactions[i] = {
                ...tx,
                ...args.data
              };
              count++;
            }
          }
        }
        return { count };
      },

      async count(args = {}) {
        const list = await this.findMany(args);
        return list.length;
      }
    },

    // Category model operations
    category: {
      async findMany(args = {}) {
        let results = [...mockData.categories];

        if (args.where?.type) {
          results = results.filter(
            c => c.type.toLowerCase() === args.where.type.toLowerCase()
          );
        }

        // Sort alphabetically by name
        results.sort((a, b) => a.name.localeCompare(b.name));
        return results;
      },

      async findUnique(args = {}) {
        const id = Number(args.where?.id);
        const item = mockData.categories.find(c => c.id === id);
        return item || null;
      },

      async findFirst(args = {}) {
        if (args.where?.name) {
          const targetName = args.where.name.toLowerCase();
          const item = mockData.categories.find(
            c => c.name.toLowerCase() === targetName
          );
          return item || null;
        }
        return mockData.categories[0] || null;
      },

      async create(args = {}) {
        const newRecord = {
          id: mockData.getNextCategoryId(),
          name: args.data.name.trim(),
          type: args.data.type || 'Expense'
        };
        mockData.categories.push(newRecord);
        return newRecord;
      },

      async update(args = {}) {
        const id = Number(args.where?.id);
        const index = mockData.categories.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Category to update not found.');
        }

        const current = mockData.categories[index];
        const updated = {
          ...current,
          ...args.data,
          id: current.id
        };

        mockData.categories[index] = updated;
        return updated;
      },

      async delete(args = {}) {
        const id = Number(args.where?.id);
        const index = mockData.categories.findIndex(c => c.id === id);
        if (index === -1) {
          throw new Error('Category to delete not found.');
        }

        const [deleted] = mockData.categories.splice(index, 1);
        return deleted;
      }
    }
  };
}

module.exports = prisma;

