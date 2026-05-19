#!/usr/bin/env bash
# Создаёт milestone и 17 issues для редизайна CyberEdu.
# Требования: gh auth login, доступ к репозиторию.
# Запуск из корня репозитория:
#   bash cyberedu/docs/scripts/create-redesign-issues.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

if ! gh auth status >/dev/null 2>&1; then
  echo "Сначала выполните: gh auth login"
  exit 1
fi

MATRIX="cyberedu/docs/REDESIGN_BACKLOG_MATRIX.md"
FOOTER=$(
  cat <<EOF

---
См. матрицу: \`$MATRIX\`
**Out of scope:** \`lib/progress.ts\`, \`lib/course-progress-guards.ts\`, Prisma, API grading routes.
EOF
)

ensure_milestone() {
  local title="$1"
  local desc="$2"
  if ! gh api "repos/{owner}/{repo}/milestones" --jq ".[].title" 2>/dev/null | grep -Fxq "$title"; then
    gh api "repos/{owner}/{repo}/milestones" -f title="$title" -f description="$desc" >/dev/null
    echo "Milestone created: $title"
  else
    echo "Milestone exists: $title"
  fi
}

create_issue() {
  local milestone="$1"
  local title="$2"
  local body="$3"
  gh issue create --title "$title" --milestone "$milestone" --body "${body}${FOOTER}"
}

ensure_milestone "Redesign — Foundation" "Phase 0–1: baseline, tokens, headers"
ensure_milestone "Redesign — Navigation" "Phase 2: student/admin nav"
ensure_milestone "Redesign — Learning path" "Phase 3: module hub, lesson, test"
ensure_milestone "Redesign — Practice" "Phase 4: practice-page-client split"
ensure_milestone "Redesign — Polish" "Phase 5–6: landing, admin review, visual CI"

M="Redesign — Foundation"

create_issue "$M" "chore: baseline playwright screenshots (phase 0)" "## Phase
0

## Scope
- Routes: /, /dashboard, /dashboard/course, module hub, lesson, test, practice, /admin
- Config: \`frontend/playwright.screenshots.config.ts\`

## Acceptance
- [ ] Baseline screenshots committed or stored as CI artifacts
- [ ] Document viewports: 320, 768, 1280"

create_issue "$M" "chore: remove slate-* from frontend (phase 1)" "## Phase
1

## Scope
- ~17 files still using \`slate-*\` (landing, roadmap, modal, admin-toolbar)
- Replace with semantic tokens per DESIGN_AUDIT.md

## Acceptance
- [ ] \`rg 'slate-' cyberedu/frontend\` → 0 in production (ui-kit optional)"

create_issue "$M" "ui: PageHeaderCore + thin Cyber/Learn/Admin/Student wrappers (phase 1)" "## Phase
1

## Scope
- Unify \`CyberPageHeader\`, \`LearnPageHeader\`, \`StudentPageHeader\`, \`AdminPageHeader\`
- No route logic changes

## Acceptance
- [ ] Single header API (title, breadcrumb, actions, optional progress)"

create_issue "$M" "ui: design tokens audit light/dark (phase 1)" "## Phase
1

## Scope
- \`app/design-tokens.css\`, \`globals.css\`, \`lib/design-system/tokens.ts\`
- Terminal SOC tokens unchanged across themes

## Acceptance
- [ ] Visual pass landing + dashboard + practice in light/dark"

M="Redesign — Navigation"

create_issue "$M" "ux: student bottom nav «Ещё» menu (phase 2)" "## Phase
2

## Scope
- \`dashboard-bottom-nav.tsx\` — add Certificate, Settings, Reviews (sidebar hidden on mobile)
- \`nav-config.ts\` studentNav

## Acceptance
- [ ] All studentNav destinations reachable on 320px without desktop sidebar"

create_issue "$M" "ux: adminNav — lessons, tests, practical-tasks (phase 2)" "## Phase
2

## Scope
- \`lib/design-system/nav-config.ts\` adminNav
- \`AdminMobileNav\`

## Acceptance
- [ ] Content CRUD routes discoverable from admin shell"

create_issue "$M" "ux: immersive routes exit affordance (phase 2)" "## Phase
2

## Scope
- \`dashboard-content-area.tsx\` hides bottom nav on lesson/practice/test
- Clear back to module hub

## Acceptance
- [ ] User can exit immersive mode in ≤2 taps on mobile"

M="Redesign — Learning path"

create_issue "$M" "ux: module hub unified step chrome (phase 3)" "## Phase
3

## Scope
- \`/dashboard/course/[moduleId]\` — \`LearningLayout\`, hub steps
- Align with future lesson/test breadcrumbs

## Risk
H (progress messaging only in UI, not engine)"

create_issue "$M" "ux: test page error.tsx + breadcrumbs (phase 3)" "## Phase
3

## Scope
- Add \`app/dashboard/course/[moduleId]/test/error.tsx\`
- \`LearnPageShell\` + \`student-nav\` breadcrumbs

## Acceptance
- [ ] Parity with lesson error/loading coverage"

create_issue "$M" "ux: lesson layout align with module stepper (phase 3)" "## Phase
3

## Scope
- \`LessonLayout\` vs \`LearningLayout\` — shared step chrome, keep separate files initially

## Acceptance
- [ ] Visual continuity hub → lesson on mobile"

create_issue "$M" "ux: course map locked module messaging (phase 3)" "## Phase
3

## Scope
- \`/dashboard/course\` — \`CourseLearningPath\`, \`?locked=1\`
- Use \`COURSE_PROGRESS_USER_MESSAGES\` copy

## Acceptance
- [ ] Locked modules explain prerequisite clearly"

M="Redesign — Practice"

create_issue "$M" "refactor: extract PracticeLabShell from practice-page-client (phase 4)" "## Phase
4

## Scope
- Split shell only: layout, top bar, aside, result — no taskType logic change
- File: \`practice-page-client.tsx\`

## Acceptance
- [ ] typecheck + test + manual practice smoke"

create_issue "$M" "refactor: PracticeTaskRouter by taskType (phase 4)" "## Phase
4

## Scope
- Router component for 12 \`PracticalTaskType\`
- Depends on PracticeLabShell issue

## Acceptance
- [ ] Each type still uses same server actions/API"

create_issue "$M" "ui: practice auto-task mobile QA (phishing/url/crypto/log) (phase 4)" "## Phase
4

## Scope
- \`practice-task-ui.tsx\`, Phishing/Url/Crypto/Log tasks
- 320px tap targets, table scroll

## Acceptance
- [ ] Manual QA checklist in PR description"

M="Redesign — Polish"

create_issue "$M" "ui: landing sections token pass (phase 5)" "## Phase
5

## Scope
- \`app/page.tsx\`, landing-* components
- SectionCard / cyber.marketingSection

## Acceptance
- [ ] No slate-* on landing; theme toggle OK"

create_issue "$M" "ui: admin submission review layout (phase 5)" "## Phase
5

## Scope
- \`/admin/submissions/[submissionId]\`, \`AdminSubmissionReviewForm\`
- Layout only — no score/status logic

## Risk
H"

create_issue "$M" "test: visual regression CI gate (phase 6)" "## Phase
6

## Scope
- Playwright screenshot diff or comparable in CI
- Compare against phase 0 baseline

## Acceptance
- [ ] Fails on unintended visual diff for pinned routes"

echo ""
echo "Done. Issues: $(gh issue list --limit 20 --json number --jq 'length') (recent)."
