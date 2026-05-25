# Docs - Project Knowledge Base

Thư mục này chứa tài liệu tham khảo cho tất cả agents.

## Cấu trúc

```
docs/
├── prd/                    # Product requirements (copy từ bmad-output)
├── architecture/           # Architecture docs (copy từ bmad-output)
├── api/                    # API documentation
├── dev-notes/              # Technical notes cho developers
│   ├── coding-conventions.md
│   ├── setup-guide.md
│   └── deployment-guide.md
└── user-guides/            # Hướng dẫn người dùng
```

## Quy tắc

- Tất cả agents có thể **đọc** docs/ để lấy context
- Chỉ cập nhật docs/ khi artifact đã được **approved**
- Giữ docs/ là **read-only reference** - không modify trực tiếp
