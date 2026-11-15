const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const defaultCategories = [
  ['Uncategorised', 'Expense'],
  ['Uncategorised Income', 'Income'],
  ['Salary', 'Income'],
  ['Freelance', 'Income'],
  ['Business', 'Income'],
  ['Other Income', 'Income'],
  ['Investment', 'Income'],
  ['Gift', 'Income'],
  ['Food', 'Expense'],
  ['Travel', 'Expense'],
  ['Shopping', 'Expense'],
  ['Education', 'Expense'],
  ['Entertainment', 'Expense'],
  ['Healthcare', 'Expense'],
  ['Bills', 'Expense'],
  ['Others', 'Expense'],
  ['Food & Dining', 'Expense'],
  ['Rent & Housing', 'Expense'],
  ['Groceries', 'Expense'],
  ['Utilities', 'Expense'],
  ['Transportation', 'Expense'],
  ['Health & Fitness', 'Expense'],
  ['Miscellaneous', 'Expense']
];

async function main() {
  for (const [name, type] of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });
    if (!existing) await prisma.category.create({ data: { name, type } });
  }
  console.log(`Ensured ${defaultCategories.length} default categories exist.`);
}

main()
  .catch(error => {
    console.error('Category seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
