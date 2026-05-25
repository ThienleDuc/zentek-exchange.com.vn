# BMAD Core Framework

> **BMAD** - Breakthrough Method for Agile AI-Driven Development

Thư mục này chứa toàn bộ cấu hình và định nghĩa agents cho BMAD framework.

## Cấu trúc thư mục

```
.bmad-core/
├── agents/           # Định nghĩa các AI agent theo vai trò
├── workflows/        # Quy trình làm việc theo từng phase
├── templates/        # Template cho các artifacts
└── config/           # Cấu hình global
```

## Các Agent trong BMAD

| Agent | Vai trò | Phase |
|-------|---------|-------|
| `analyst` | Business Analyst - Phân tích yêu cầu | Phase 1 |
| `pm` | Product Manager - Quản lý sản phẩm | Phase 2 |
| `architect` | Software Architect - Thiết kế hệ thống | Phase 3 |
| `dev` | Developer - Phát triển tính năng | Phase 4 |
| `qa` | QA Engineer - Kiểm thử chất lượng | Phase 4 |
| `po` | Product Owner - Xem xét & chấp thuận | All |
| `sm` | Scrum Master - Điều phối workflow | All |
| `bmad-master` | Orchestrator - Điều phối toàn bộ | All |
| `bmad-help` | Help Agent - Hỗ trợ & hướng dẫn | All |

## Quy tắc sử dụng

1. **Không chain workflow**: Mỗi phase chạy trong context window mới
2. **Artifact-driven**: Trạng thái workflow được xác định bởi các file output
3. **Validate**: Dùng model mạnh để validate các artifact quan trọng (PRD, Architecture)
