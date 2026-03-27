const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 7788;

// Phục vụ các file tĩnh trong thư mục hiện tại
app.use(express.static(__dirname));

// Route chính trả về index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Dành cho Vercel Serverless Function
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`🚀 LaTeX Helper Server is running!`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`==========================================`);
  });
}
