import { describe, expect, it } from "vitest";
import {
  mapReviewIntentToStatus,
  reviewIntentRequiresConfirm,
} from "@/lib/admin-submission-review-intent";

describe("admin submission review intent", () => {
  it("maps intents to server statuses", () => {
    expect(mapReviewIntentToStatus("accept")).toBe("ACCEPTED");
    expect(mapReviewIntentToStatus("reject")).toBe("REJECTED");
    expect(mapReviewIntentToStatus("revision")).toBe("NEEDS_REVISION");
    expect(mapReviewIntentToStatus("comment")).toBeNull();
    expect(mapReviewIntentToStatus("")).toBeNull();
  });

  it("requires confirm for status-changing intents", () => {
    expect(reviewIntentRequiresConfirm("accept")).toBe(true);
    expect(reviewIntentRequiresConfirm("reject")).toBe(true);
    expect(reviewIntentRequiresConfirm("revision")).toBe(true);
  });
});
