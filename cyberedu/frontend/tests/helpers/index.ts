export {
  assertAdminRouteBlocked,
  assertLoggedOut,
  attachAuthDebug,
  credentialsSignIn,
  getSessionEmail,
  loginAs,
  logout,
  resetAuthStorage,
  sidebarLogoutButton,
  waitForEmptySession,
} from "../../e2e/helpers/auth";

export {
  openFirstLessonPage,
  openFirstPracticePage,
  openFirstTestPage,
  startTestAttempt,
  submitModuleTest,
  submitPracticeTextIfPresent,
} from "../../e2e/helpers/course-flow";

export {
  createE2eUnverifiedUser,
  ensureE2eDemoUsersReady,
  ensureE2eUserPassword,
  issueE2eEmailVerificationUrl,
  resetServerAuthGuards,
} from "../../e2e/helpers/verification";

export {
  expectPracticeSubmissionPersistedForStudent,
  expectTestAttemptPersistedForStudent,
} from "../../e2e/helpers/persistence";

export * from "./navigation";
export * from "./admin";
export * from "./uploads";
export * from "./hydration";
export * from "./rate-limit";
