# Phase 2: Product Planning Workflow

## Mục tiêu
Chuyển đổi project brief thành Product Requirements Document chi tiết,
user stories có thể thực thi, và UX brief cho designer.

## Điều kiện bắt đầu
- `bmad-output/phase-1/project-brief.md` đã approved
- `bmad-output/phase-1/brainstorm.md` đã có

## Điều kiện hoàn thành
- [ ] `bmad-output/phase-2/prd.md` đã được tạo và PO approved
- [ ] `bmad-output/phase-2/user-stories.md` đã được tạo
- [ ] `bmad-output/phase-2/ux-brief.md` đã được tạo

---

## Bước 1: Product Manager tạo PRD

**Prompt mẫu:**
```
Đọc bmad-output/phase-1/ và đóng vai Product Manager.
Tạo PRD đầy đủ vào bmad-output/phase-2/prd.md bao gồm:
- Executive Summary
- Problem Statement
- Goals & KPIs
- User Personas
- Feature Requirements (MoSCoW)
- Non-functional Requirements
- Timeline & Milestones
```

---

## Bước 2: Tạo User Stories

**Prompt mẫu:**
```
Dựa trên PRD vừa tạo, viết user stories chi tiết cho tất cả features
vào bmad-output/phase-2/user-stories.md
Mỗi story cần có acceptance criteria rõ ràng.
```

---

## Bước 3: PO Review PRD

**Prompt mẫu:**
```
Đóng vai Product Owner, review bmad-output/phase-2/prd.md
Kiểm tra: business value, feasibility, clarity, completeness
Đưa ra APPROVED hoặc NEEDS REVISION với feedback cụ thể.
```

---

## Output Files

```
bmad-output/phase-2/
├── prd.md              # Product Requirements Document
├── user-stories.md     # User stories theo epics
└── ux-brief.md         # UX/UI requirements brief
```

## Chuyển sang Phase 3
```
Đọc bmad-output/phase-2/ và bắt đầu Phase 3 với vai trò Software Architect
```
