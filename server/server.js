import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(join(__dirname, 'stackit.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      location TEXT,
      website TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Questions table
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      votes INTEGER DEFAULT 0,
      accepted_answer_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id),
      FOREIGN KEY (accepted_answer_id) REFERENCES answers (id)
    )`);

    // Tags table
    db.run(`CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )`);

    // Question tags junction table
    db.run(`CREATE TABLE IF NOT EXISTS question_tags (
      question_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (question_id, tag_id),
      FOREIGN KEY (question_id) REFERENCES questions (id),
      FOREIGN KEY (tag_id) REFERENCES tags (id)
    )`);

    // Answers table
    db.run(`CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      votes INTEGER DEFAULT 0,
      is_accepted BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions (id),
      FOREIGN KEY (author_id) REFERENCES users (id)
    )`);

    // Votes table
    db.run(`CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      target_type TEXT NOT NULL, -- 'question' or 'answer'
      target_id INTEGER NOT NULL,
      vote_type TEXT NOT NULL, -- 'up' or 'down'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, target_type, target_id)
    )`);
  });
};

// Initialize database
initDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ 
          success: true, 
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        role: user.role
      }
    });
  });
});

// Get user profile
app.get('/api/users/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, avatar, bio, location, website, role, created_at, last_login FROM users WHERE id = ?', 
    [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    });
});

// Update user profile
app.put('/api/users/profile', authenticateToken, (req, res) => {
  const { username, bio, location, website, avatar } = req.body;

  db.run(
    'UPDATE users SET username = ?, bio = ?, location = ?, website = ?, avatar = ? WHERE id = ?',
    [username, bio, location, website, avatar, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Profile updated successfully' });
    }
  );
});

// Get user stats (questions, answers, etc.)
app.get('/api/users/stats', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.serialize(() => {
    db.get('SELECT COUNT(*) as questions FROM questions WHERE author_id = ?', [userId], (err, qRow) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      db.get('SELECT COUNT(*) as answers FROM answers WHERE author_id = ?', [userId], (err, aRow) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        // You can add more stats here (reputation, badges, etc.)
        res.json({
          questions: qRow.questions,
          answers: aRow.answers,
          reputation: 0, // Placeholder
          badges: 0      // Placeholder
        });
      });
    });
  });
});

// Get all questions
app.get('/api/questions', (req, res) => {
  const { sort = 'newest', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let orderBy = 'ORDER BY q.created_at DESC';
  if (sort === 'votes') {
    orderBy = 'ORDER BY q.votes DESC';
  } else if (sort === 'unanswered') {
    orderBy = 'ORDER BY (SELECT COUNT(*) FROM answers WHERE question_id = q.id) ASC';
  }

  const query = `
    SELECT 
      q.*,
      u.username as author_username,
      u.avatar as author_avatar,
      (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
    FROM questions q
    JOIN users u ON q.author_id = u.id
    ${orderBy}
    LIMIT ? OFFSET ?
  `;

  db.all(query, [limit, offset], (err, questions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get tags for each question
    const questionsWithTags = questions.map(question => {
      return new Promise((resolve) => {
        db.all('SELECT t.name FROM tags t JOIN question_tags qt ON t.id = qt.tag_id WHERE qt.question_id = ?', 
          [question.id], (err, tags) => {
            resolve({
              ...question,
              tags: tags.map(tag => tag.name)
            });
          });
      });
    });

    Promise.all(questionsWithTags).then(questions => {
      res.json(questions);
    });
  });
});

// Get single question
app.get('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;

  db.get(`
    SELECT 
      q.*,
      u.username as author_username,
      u.avatar as author_avatar
    FROM questions q
    JOIN users u ON q.author_id = u.id
    WHERE q.id = ?
  `, [questionId], (err, question) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Get tags
    db.all('SELECT t.name FROM tags t JOIN question_tags qt ON t.id = qt.tag_id WHERE qt.question_id = ?', 
      [questionId], (err, tags) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Get answers
        db.all(`
          SELECT 
            a.*,
            u.username as author_username,
            u.avatar as author_avatar
          FROM answers a
          JOIN users u ON a.author_id = u.id
          WHERE a.question_id = ?
          ORDER BY a.is_accepted DESC, a.votes DESC, a.created_at ASC
        `, [questionId], (err, answers) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            ...question,
            tags: tags.map(tag => tag.name),
            answers
          });
        });
      });
  });
});

// Create question
app.post('/api/questions', authenticateToken, (req, res) => {
  const { title, description, tags } = req.body;
  const authorId = req.user.id;

  if (!title || !description || !tags || tags.length === 0) {
    return res.status(400).json({ error: 'Title, description, and at least one tag are required' });
  }

  db.run('INSERT INTO questions (title, description, author_id) VALUES (?, ?, ?)', 
    [title, description, authorId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const questionId = this.lastID;

      // Insert tags
      const insertTags = tags.map(tag => {
        return new Promise((resolve) => {
          // First, insert tag if it doesn't exist
          db.run('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tag], function() {
            // Then get tag id and create relationship
            db.get('SELECT id FROM tags WHERE name = ?', [tag], (err, tagRow) => {
              if (tagRow) {
                db.run('INSERT INTO question_tags (question_id, tag_id) VALUES (?, ?)', 
                  [questionId, tagRow.id], resolve);
              } else {
                resolve();
              }
            });
          });
        });
      });

      Promise.all(insertTags).then(() => {
        res.status(201).json({ 
          success: true, 
          message: 'Question created successfully',
          questionId 
        });
      });
    });
});

// Create answer
app.post('/api/questions/:id/answers', authenticateToken, (req, res) => {
  const questionId = req.params.id;
  const { content } = req.body;
  const authorId = req.user.id;

  if (!content) {
    return res.status(400).json({ error: 'Answer content is required' });
  }

  db.run('INSERT INTO answers (question_id, author_id, content) VALUES (?, ?, ?)', 
    [questionId, authorId, content], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ 
        success: true, 
        message: 'Answer created successfully',
        answerId: this.lastID 
      });
    });
});

// Vote on question or answer
app.post('/api/vote', authenticateToken, (req, res) => {
  const { targetType, targetId, voteType } = req.body;
  const userId = req.user.id;

  if (!['question', 'answer'].includes(targetType) || !['up', 'down'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote parameters' });
  }

  const table = targetType === 'question' ? 'questions' : 'answers';

  db.run(`
    INSERT OR REPLACE INTO votes (user_id, target_type, target_id, vote_type) 
    VALUES (?, ?, ?, ?)
  `, [userId, targetType, targetId, voteType], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Update vote count
    db.run(`
      UPDATE ${table} SET votes = (
        SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 WHEN vote_type = 'down' THEN -1 ELSE 0 END), 0)
        FROM votes 
        WHERE target_type = ? AND target_id = ?
      )
      WHERE id = ?
    `, [targetType, targetId, targetId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Vote recorded successfully' });
    });
  });
});

// Accept answer
app.post('/api/answers/:id/accept', authenticateToken, (req, res) => {
  const answerId = req.params.id;

  // Check if user owns the question
  db.get(`
    SELECT q.author_id, q.id as question_id 
    FROM questions q 
    JOIN answers a ON q.id = a.question_id 
    WHERE a.id = ?
  `, [answerId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!result) {
      return res.status(404).json({ error: 'Answer not found' });
    }
    if (result.author_id !== req.user.id) {
      return res.status(403).json({ error: 'Only question author can accept answers' });
    }

    db.run('UPDATE answers SET is_accepted = 1 WHERE id = ?', [answerId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      db.run('UPDATE questions SET accepted_answer_id = ? WHERE id = ?', [answerId, result.question_id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, message: 'Answer accepted successfully' });
      });
    });
  });
});

// Search questions
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const query = `
    SELECT DISTINCT
      q.*,
      u.username as author_username,
      u.avatar as author_avatar,
      (SELECT COUNT(*) FROM answers WHERE question_id = q.id) as answer_count
    FROM questions q
    JOIN users u ON q.author_id = u.id
    LEFT JOIN question_tags qt ON q.id = qt.question_id
    LEFT JOIN tags t ON qt.tag_id = t.id
    WHERE q.title LIKE ? OR q.description LIKE ? OR t.name LIKE ?
    ORDER BY q.created_at DESC
  `;

  const searchTerm = `%${q}%`;
  db.all(query, [searchTerm, searchTerm, searchTerm], (err, questions) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get tags for each question
    const questionsWithTags = questions.map(question => {
      return new Promise((resolve) => {
        db.all('SELECT t.name FROM tags t JOIN question_tags qt ON t.id = qt.tag_id WHERE qt.question_id = ?', 
          [question.id], (err, tags) => {
            resolve({
              ...question,
              tags: tags.map(tag => tag.name)
            });
          });
      });
    });

    Promise.all(questionsWithTags).then(questions => {
      res.json(questions);
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 