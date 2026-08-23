const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Helper to read database
function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB file:', err);
    return { students: [], classes: [] };
  }
}

// Helper to write database
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

// Helper to parse JSON body
function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Main Request Handler
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  // Simulating API latency (average 300ms)
  let delay = 300;

  // Error simulation query parameters
  const simulateError = searchParams.get('simulateError');
  const simulateTimeout = searchParams.get('simulateTimeout');

  if (simulateTimeout === 'true') {
    console.log('  -> Simulating Network Timeout (delaying 4000ms)');
    delay = 4000;
  }

  setTimeout(async () => {
    if (simulateError) {
      console.log(`  -> Simulating API Error: ${simulateError}`);
      res.writeHead(parseInt(simulateError), { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Simulated server error: ${simulateError}` }));
      return;
    }

    try {
      // 1. GET /api/students (with optional q, className, status filtering)
      if (pathname === '/api/students' && req.method === 'GET') {
        const db = readDb();
        let list = db.students || [];

        // Apply filters
        const q = searchParams.get('q');
        const className = searchParams.get('className');
        const status = searchParams.get('status');

        if (q) {
          const query = q.trim().toLowerCase();
          list = list.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query)
          );
        }

        if (className && className !== 'ALL') {
          list = list.filter(s => s.className === className);
        }

        if (status && status !== 'ALL') {
          list = list.filter(s => s.status === status);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(list));
        return;
      }

      // 2. GET /api/students/:id
      const studentIdMatch = pathname.match(/^\/api\/students\/([A-Za-z0-9]+)$/);
      if (studentIdMatch && req.method === 'GET') {
        const studentId = studentIdMatch[1];
        const db = readDb();
        const student = db.students.find(s => s.id === studentId);

        if (student) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(student));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `Không tìm thấy sinh viên ID: ${studentId}` }));
        }
        return;
      }

      // 3. POST /api/students
      if (pathname === '/api/students' && req.method === 'POST') {
        const body = await getJsonBody(req);
        if (!body.name || !body.email || !body.className) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Dữ liệu không đầy đủ hoặc không hợp lệ!' }));
          return;
        }

        const db = readDb();
        // Generate new ID STD2026XXX
        const ids = db.students.map(s => {
          const num = parseInt(s.id.replace('STD', ''));
          return isNaN(num) ? 2026000 : num;
        });
        const maxId = ids.length > 0 ? Math.max(...ids) : 2026000;
        const newId = `STD${maxId + 1}`;

        const newStudent = {
          id: newId,
          name: body.name,
          email: body.email,
          gender: body.gender || 'Nam',
          className: body.className,
          birthDate: body.birthDate || new Date().toISOString().split('T')[0],
          gpa: parseFloat(body.gpa) || 0.0,
          status: body.status || 'Active'
        };

        db.students.unshift(newStudent); // add to top
        writeDb(db);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newStudent));
        return;
      }

      // 4. PUT /api/students/:id
      if (studentIdMatch && req.method === 'PUT') {
        const studentId = studentIdMatch[1];
        const body = await getJsonBody(req);
        const db = readDb();
        const index = db.students.findIndex(s => s.id === studentId);

        if (index !== -1) {
          const updatedStudent = {
            ...db.students[index],
            name: body.name !== undefined ? body.name : db.students[index].name,
            email: body.email !== undefined ? body.email : db.students[index].email,
            gender: body.gender !== undefined ? body.gender : db.students[index].gender,
            className: body.className !== undefined ? body.className : db.students[index].className,
            birthDate: body.birthDate !== undefined ? body.birthDate : db.students[index].birthDate,
            gpa: body.gpa !== undefined ? parseFloat(body.gpa) : db.students[index].gpa,
            status: body.status !== undefined ? body.status : db.students[index].status
          };

          db.students[index] = updatedStudent;
          writeDb(db);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(updatedStudent));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `Không tìm thấy sinh viên ID ${studentId} để cập nhật!` }));
        }
        return;
      }

      // 5. DELETE /api/students/:id
      if (studentIdMatch && req.method === 'DELETE') {
        const studentId = studentIdMatch[1];
        const db = readDb();
        const index = db.students.findIndex(s => s.id === studentId);

        if (index !== -1) {
          const deletedName = db.students[index].name;
          db.students.splice(index, 1);
          writeDb(db);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: `Đã xóa sinh viên ${deletedName}` }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: `Không tìm thấy sinh viên ID ${studentId} để xóa!` }));
        }
        return;
      }

      // 6. GET /api/classes
      if (pathname === '/api/classes' && req.method === 'GET') {
        const db = readDb();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(db.classes || []));
        return;
      }

      // 7. GET /api/statistics (dynamically computed)
      if (pathname === '/api/statistics' && req.method === 'GET') {
        const db = readDb();
        const students = db.students || [];

        const totalCount = students.length;
        const activeCount = students.filter(s => s.status === 'Active').length;
        const graduatedCount = students.filter(s => s.status === 'Graduated').length;
        const suspendedCount = students.filter(s => s.status === 'Suspended').length;

        const totalGpa = students.reduce((sum, s) => sum + (s.gpa || 0), 0);
        const averageGpa = totalCount > 0 ? parseFloat((totalGpa / totalCount).toFixed(2)) : 0.0;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          totalCount,
          activeCount,
          graduatedCount,
          suspendedCount,
          averageGpa
        }));
        return;
      }

      // Default 404 Route
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'API Endpoint không tồn tại!' }));
    } catch (err) {
      console.error('Error handling API request:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Lỗi máy chủ nội bộ!', details: err.message }));
    }
  }, delay);
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Mock API Server is running on http://localhost:${PORT}`);
  console.log(`👉 Available REST Endpoints:`);
  console.log(`   - GET    /api/students`);
  console.log(`   - GET    /api/students/:id`);
  console.log(`   - POST   /api/students`);
  console.log(`   - PUT    /api/students/:id`);
  console.log(`   - DELETE /api/students/:id`);
  console.log(`   - GET    /api/classes`);
  console.log(`   - GET    /api/statistics`);
  console.log(`👉 Simulation parameters (add to query strings):`);
  console.log(`   - ?simulateError=500 (or 404, etc.)`);
  console.log(`   - ?simulateTimeout=true`);
  console.log(`===================================================`);
});
