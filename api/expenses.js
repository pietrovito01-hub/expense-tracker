export default async function handler(req, res) {
  // NOTE: In a serverless environment, this global variable will reset
  // whenever the function "cold starts" or is redeployed.
  // For permanent storage, you would connect to a database here.
  // We use a global variable outside the handler to persist data 
  // as long as the container stays "warm".
  if (!global.expensesData) {
    global.expensesData = [];
  }

  // Set CORS headers to allow access from any origin (useful for testing)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'success',
      count: global.expensesData.length,
      data: global.expensesData,
    });
  }

  if (req.method === 'POST') {
    try {
      const { amount, description, category, date } = req.body;

      // Validation
      const missingFields = [];
      if (!amount) missingFields.push('amount');
      if (!description) missingFields.push('description');
      if (!category) missingFields.push('category');
      if (!date) missingFields.push('date');

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields',
          fields: missingFields
        });
      }

      const newExpense = {
        id: Date.now().toString(), // Simple unique ID
        amount: parseFloat(amount),
        description,
        category,
        date
      };

      global.expensesData.push(newExpense);

      return res.status(201).json({
        status: 'success',
        message: 'Expense added successfully',
        data: newExpense
      });

    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        error: error.message
      });
    }
  }

  // Method not allowed
  return res.status(405).json({
    status: 'error',
    message: 'Method Not Allowed'
  });
}
