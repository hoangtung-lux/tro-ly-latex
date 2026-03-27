---
description: Workflow để xây dựng và mở rộng app hỗ trợ LaTeX cho người dùng cuối
---

# LaTeX Support App – Workflow

App này là một trình hỗ trợ LaTeX chạy trên trình duyệt (HTML/JS/CSS thuần).
Dành cho người mới học LaTeX: gợi ý nhẹ nhàng, tra cứu bách khoa lệnh, và preview code.

---

## 1. Khởi chạy app

Mở file `index.html` bằng trình duyệt bất kỳ (Chrome, Edge, Firefox).
Không cần cài thêm gì, chạy offline hoàn toàn.

// turbo
```powershell
Start-Process "c:\Users\Admin\Documents\latex\index.html"
```

---

## 2. Thêm lệnh LaTeX vào bách khoa toàn thư

Mở file `data/commands.json` và thêm entry mới theo format:

```json
{
  "name": "\\tenlenh",
  "category": "Nhóm lệnh (vd: Toán học)",
  "description": "Mô tả ngắn gọn lệnh này làm gì",
  "syntax": "\\tenlenh{tham_so}",
  "example": "\\tenlenh{x}",
  "output": "Kết quả hiển thị trên LaTeX"
}
```

Danh mục hợp lệ:
- `Cấu trúc tài liệu`
- `Toán học`
- `Định dạng văn bản`
- `Danh sách`
- `Bảng biểu`
- `Hình ảnh`
- `Tham chiếu`
- `Ký hiệu đặc biệt`

---

## 3. Mở rộng gợi ý thông minh

File `js/autocomplete.js` chứa danh sách trigger words.
Thêm lệnh mới vào mảng `LATEX_COMMANDS` theo format:

```js
{ trigger: "\\tenlenh", label: "\\tenlenh{}", desc: "Mô tả ngắn" }
```

---

## 4. Cập nhật app (khi thêm tính năng mới)

Quy trình chuẩn khi mở rộng app:

1. Cập nhật `data/commands.json` (bách khoa)
2. Cập nhật `js/autocomplete.js` (gợi ý)
3. Nếu thêm UI mới → sửa `index.html` và `css/style.css`
4. Test thủ công bằng cách mở lại `index.html`

---

## 5. Reset / Reload không mất data

App lưu draft vào `localStorage` của trình duyệt.
Để xóa draft cũ:

```js
// Mở DevTools (F12) → Console → gõ:
localStorage.clear()
```

---

## 6. Export code LaTeX

Nhấn nút **"Sao chép"** trên giao diện để copy toàn bộ code LaTeX vào clipboard.
Hoặc tự copy từ ô editor bên trái.

---

## Cấu trúc thư mục

```
latex/
├── index.html          ← App chính
├── css/
│   └── style.css       ← Toàn bộ style
├── js/
│   ├── app.js          ← Logic chính (editor, preview)
│   ├── autocomplete.js ← Gợi ý lệnh
│   └── encyclopedia.js ← Tra cứu bách khoa
├── data/
│   └── commands.json   ← Dữ liệu bách khoa lệnh LaTeX
└── .agents/
    └── workflows/
        └── latex-support-app.md ← File này
```
