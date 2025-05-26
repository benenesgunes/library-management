const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

const authenticateStaff = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.userType !== 'staff') {
      return res.status(403).json({ success: false, message: 'Staff access required' });
    }
    next();
  });
};

const authenticateMember = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user.userType !== 'member') {
      return res.status(403).json({ success: false, message: 'Member access required' });
    }
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Library Management System API',
    version: '1.0.0'
  });
});

// AUTH ROUTES
app.post('/api/auth/member/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, address } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    const [existing] = await db.execute('SELECT Member_ID FROM Member WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO Member (First_Name, Last_Name, Phone_Number, Email, Password, Address) VALUES (?, ?, ?, ?, ?, ?)',
      [firstName, lastName, phoneNumber || null, email, hashedPassword, address || null]
    );

    const token = jwt.sign({ id: result.insertId, userType: 'member', email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { memberId: result.insertId, firstName, lastName, email, token }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/member/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await db.execute('SELECT Member_ID, First_Name, Last_Name, Email, Password FROM Member WHERE Email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const member = rows[0];
    const isValid = await bcrypt.compare(password, member.Password);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: member.Member_ID, userType: 'member', email: member.Email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        memberId: member.Member_ID,
        name: `${member.First_Name} ${member.Last_Name}`,
        email: member.Email,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/staff/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await db.execute('SELECT Staff_ID, First_Name, Last_Name, Email, Password, Role_Level FROM Staff WHERE Email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const staff = rows[0];
    const isValid = await bcrypt.compare(password, staff.Password);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: staff.Staff_ID, userType: 'staff', email: staff.Email }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        staffId: staff.Staff_ID,
        name: `${staff.First_Name} ${staff.Last_Name}`,
        email: staff.Email,
        role: staff.Role_Level,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// MEMBER ROUTES
app.get('/api/member/books', authenticateMember, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        b.Book_ID,
        b.Title,
        b.Publication_Year,
        b.Publisher,
        b.Number_of_Copies,
        CONCAT(a.First_Name, ' ', a.Last_Name) as Author_Name,
        c.Name as Category_Name,
        (b.Number_of_Copies - COALESCE(active_loans.count, 0)) as Available_Copies
      FROM Book b
      LEFT JOIN Author a ON b.Author_ID = a.Author_ID
      LEFT JOIN Category c ON b.Category_ID = c.Category_ID
      LEFT JOIN (
        SELECT Book_ID, COUNT(*) as count 
        FROM Loan 
        WHERE Return_Status = FALSE 
        GROUP BY Book_ID
      ) active_loans ON b.Book_ID = active_loans.Book_ID
      WHERE (b.Number_of_Copies - COALESCE(active_loans.count, 0)) > 0
      ORDER BY b.Title
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving books' });
  }
});

app.get('/api/member/books/filter', authenticateMember, async (req, res) => {
  try {
    const { category, author } = req.query;

    let query = `
      SELECT 
        b.Book_ID,
        b.Title,
        b.Publication_Year,
        b.Publisher,
        b.Number_of_Copies,
        CONCAT(a.First_Name, ' ', a.Last_Name) as Author_Name,
        c.Name as Category_Name,
        (b.Number_of_Copies - COALESCE(active_loans.count, 0)) as Available_Copies
      FROM Book b
      LEFT JOIN Author a ON b.Author_ID = a.Author_ID
      LEFT JOIN Category c ON b.Category_ID = c.Category_ID
      LEFT JOIN (
        SELECT Book_ID, COUNT(*) as count 
        FROM Loan 
        WHERE Return_Status = FALSE 
        GROUP BY Book_ID
      ) active_loans ON b.Book_ID = active_loans.Book_ID
      WHERE 1=1
    `;

    const values = [];

    if (category) {
      query += ` AND c.Name LIKE ?`;
      values.push(`%${category}%`);
    }

    if (author) {
      query += ` AND CONCAT(a.First_Name, ' ', a.Last_Name) LIKE ?`;
      values.push(`%${author}%`);
    }

    query += ` AND (b.Number_of_Copies - COALESCE(active_loans.count, 0)) > 0`;
    query += ` ORDER BY b.Title`;

    const [rows] = await db.execute(query, values);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Filter books error:', error);
    res.status(500).json({ success: false, message: 'Error filtering books' });
  }
});

app.get('/api/member/loans', authenticateMember, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        l.Loan_ID,
        l.Borrow_Date,
        l.Return_Date,
        l.Return_Status,
        b.Title as Book_Title,
        CONCAT(a.First_Name, ' ', a.Last_Name) as Author_Name
      FROM Loan l
      JOIN Book b ON l.Book_ID = b.Book_ID
      LEFT JOIN Author a ON b.Author_ID = a.Author_ID
      WHERE l.Member_ID = ?
      ORDER BY l.Borrow_Date DESC
    `, [req.user.id]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving loans' });
  }
});

// STAFF ROUTES
app.get('/api/staff/books', authenticateStaff, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        b.Book_ID,
        b.Title,
        b.Publication_Year,
        b.Publisher,
        b.Number_of_Copies,
        b.Shelf_Number,
        CONCAT(a.First_Name, ' ', a.Last_Name) as Author_Name,
        c.Name as Category_Name
      FROM Book b
      LEFT JOIN Author a ON b.Author_ID = a.Author_ID
      LEFT JOIN Category c ON b.Category_ID = c.Category_ID
      ORDER BY b.Title
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving books' });
  }
});

app.get('/api/staff/loans', authenticateStaff, async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        l.Loan_ID,
        l.Borrow_Date,
        l.Return_Date,
        l.Return_Status,
        b.Title as Book_Title,
        CONCAT(a.First_Name, ' ', a.Last_Name) as Author_Name,
        CONCAT(m.First_Name, ' ', m.Last_Name) as Member_Name,
        m.Email as Member_Email,
        CONCAT(s.First_Name, ' ', s.Last_Name) as Staff_Name
      FROM Loan l
      JOIN Book b ON l.Book_ID = b.Book_ID
      JOIN Member m ON l.Member_ID = m.Member_ID
      LEFT JOIN Staff s ON l.Staff_ID = s.Staff_ID
      LEFT JOIN Author a ON b.Author_ID = a.Author_ID
      ORDER BY l.Borrow_Date DESC
    `);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get all loans error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving loans' });
  }
});

app.post('/api/staff/loans', authenticateStaff, async (req, res) => {
  try {
    const { bookId, memberId } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({ success: false, message: 'Book ID and Member ID are required' });
    }

    const [bookRows] = await db.execute('SELECT Number_of_Copies FROM Book WHERE Book_ID = ?', [bookId]);
    if (bookRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const [activeLoanRows] = await db.execute(
      'SELECT COUNT(*) as count FROM Loan WHERE Book_ID = ? AND Return_Status = FALSE',
      [bookId]
    );

    if (activeLoanRows[0].count >= bookRows[0].Number_of_Copies) {
      return res.status(400).json({ success: false, message: 'No copies available' });
    }

    const [result] = await db.execute(
      'INSERT INTO Loan (Book_ID, Member_ID, Staff_ID, Borrow_Date, Return_Status) VALUES (?, ?, ?, NOW(), FALSE)',
      [bookId, memberId, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Book loaned successfully',
      data: { loanId: result.insertId }
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ success: false, message: 'Error creating loan' });
  }
});

app.put('/api/staff/loans/:loanId/return', authenticateStaff, async (req, res) => {
  try {
    const { loanId } = req.params;

    const [loanRows] = await db.execute(`
      SELECT 
        l.Loan_ID, 
        l.Return_Status, 
        b.Title as Book_Title,
        CONCAT(m.First_Name, ' ', m.Last_Name) as Member_Name,
        m.Email as Member_Email
      FROM Loan l
      JOIN Book b ON l.Book_ID = b.Book_ID
      JOIN Member m ON l.Member_ID = m.Member_ID
      WHERE l.Loan_ID = ?
    `, [loanId]);

    if (loanRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Loan not found' 
      });
    }

    const loan = loanRows[0];

    if (loan.Return_Status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Book has already been returned' 
      });
    }

    await db.execute(
      'UPDATE Loan SET Return_Status = TRUE, Return_Date = NOW() WHERE Loan_ID = ?',
      [loanId]
    );

    res.json({
      success: true,
      message: `Book "${loan.Book_Title}" returned successfully by staff`,
      data: { 
        loanId: parseInt(loanId), 
        bookTitle: loan.Book_Title,
        memberName: loan.Member_Name,
        memberEmail: loan.Member_Email,
        returnedBy: req.user.id
      }
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ success: false, message: 'Error returning book' });
  }
});

app.get('/api/authors', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        CONCAT(First_Name, " ", Last_Name) as Author_Name
        from Author`)

    res.json({success: true, data: rows})
  } catch(error) {
    console.error('Get authors error:', error);
    res.status(500).json({ success: false, message: 'Error getting authors' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        Name as Category_Name
        from Category`)

    res.json({success: true, data: rows})
  } catch(error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Error getting categories' });
  }
});

const startServer = async () => {
  try {
    await db.execute('SELECT 1');
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Library Management System API ready!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();