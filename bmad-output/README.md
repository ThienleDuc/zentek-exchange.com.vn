# BMAD Output - Artifact Storage

Thư mục này chứa tất cả artifacts được tạo bởi BMAD agents.
Đây là **source of truth** cho trạng thái project.

## Cấu trúc

```
bmad-output/
├── phase-1/                # Analysis & Discovery artifacts
│   ├── project-brief.md
│   ├── market-research.md
│   └── brainstorm.md
│
├── phase-2/                # Product Planning artifacts
│   ├── prd.md
│   ├── user-stories.md
│   └── ux-brief.md
│
├── phase-3/                # Technical Design artifacts
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── database-schema.md
│   ├── api-contracts.md
│   └── adr/
│       └── adr-001-*.md
│
└── phase-4/                # Implementation artifacts
    ├── sprint-plan.md
    ├── stories/
    │   └── story-[epic]-[num]-[name].md
    ├── test-plan.md
    ├── test-cases/
    └── qa-report.md
```

## Quy tắc

- Artifacts chỉ được tạo bởi **agents được chỉ định**
- **Không xóa** artifacts đã approved
- Đánh dấu rõ status trong mỗi file: Draft | In Review | Approved
- Phải có PO approval trước khi chuyển phase

## Trạng thái hiện tại

**Phase hiện tại**: Phase 1 - Analysis & Discovery (chưa bắt đầu)

**Checklist**:
- [ ] Phase 1 artifacts
- [ ] Phase 2 artifacts
- [ ] Phase 3 artifacts
- [ ] Phase 4 artifacts
