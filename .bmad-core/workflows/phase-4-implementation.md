# Phase 4: Implementation Workflow

## Mục tiêu
Implement tính năng theo sprint plan, đảm bảo chất lượng qua testing và review.

## Điều kiện bắt đầu
- `bmad-output/phase-2/prd.md` đã có
- `bmad-output/phase-2/user-stories.md` đã có
- `bmad-output/phase-2/ux-brief.md` đã có
- `bmad-output/phase-3/architecture.md` đã approved
- `bmad-output/phase-3/tech-stack.md` đã có
- `bmad-output/phase-3/database-schema.md` đã có
- `bmad-output/phase-3/api-contracts.md` đã có

## Chu trình Sprint (lặp lại)

```
SM tạo Sprint Plan → SM tạo Stories → Dev implement → QA test → PO review → Done
```

---

## Bước 1: Scrum Master lập Sprint Plan

**Prompt mẫu:**
```
Đọc bmad-output/phase-2/user-stories.md, bmad-output/phase-3/architecture.md và bmad-output/phase-3/database-schema.md
Đóng vai Scrum Master và tạo Sprint 1 plan:
1. Sprint goal
2. Stories trong sprint (top priority)
3. Tasks breakdown cho mỗi story
4. Tạo story files vào bmad-output/phase-4/stories/
```

---

## Bước 2: Developer implement Story

**Prompt mẫu:**
```
Đọc bmad-output/phase-4/stories/[story-file].md
Đọc các tài liệu sau để nắm rõ context kỹ thuật:
- bmad-output/phase-3/architecture.md
- bmad-output/phase-3/tech-stack.md
- bmad-output/phase-3/database-schema.md
- bmad-output/phase-3/api-contracts.md
- bmad-output/phase-2/ux-brief.md

Đóng vai Developer và implement story này.
Tạo code trong thư mục dự án, tuân thủ đúng kiến trúc, database schema và API contracts.
Cập nhật status của story thành "In Review".
```

---

## Bước 3: QA Test

**Prompt mẫu:**
```
Đọc bmad-output/phase-4/stories/[story-file].md, bmad-output/phase-2/prd.md và bmad-output/phase-3/api-contracts.md
Đóng vai QA Engineer:
1. Review code đã implement
2. Test theo acceptance criteria và API contracts
3. Tìm edge cases và bugs
4. Report kết quả vào bmad-output/phase-4/qa-report.md
```

---

## Bước 4: PO Acceptance

**Prompt mẫu:**
```
Đọc story [story-name] và QA report.
Đối chiếu với bmad-output/phase-2/prd.md
Đóng vai Product Owner và quyết định: ACCEPTED hoặc NEEDS REWORK
```

---

## Output Files

```
bmad-output/phase-4/
├── sprint-plan.md
├── stories/
│   ├── story-auth-01-register.md
│   ├── story-shop-01-open-shop.md
│   ├── story-prod-01-create-product.md
│   ├── story-ord-01-cart-checkout.md
│   ├── story-chat-01-public-room.md
│   └── ...
├── test-plan.md
├── test-cases/
│   ├── auth-test-cases.md
│   ├── shop-test-cases.md
│   ├── product-test-cases.md
│   └── ...
└── qa-report.md
```

## Story Status Flow
```
Draft → Ready → In Progress → In Review → QA → Accepted | Rejected
```
