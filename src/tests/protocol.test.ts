import { describe, it, expect } from "vitest";
import { PHASES, DAILY_INPUTS, HARD_RULES, HUNDRED_DAY_SCHEDULE } from "../data/protocol";

describe("Protocol 100 Data & Rules", () => {
  it("should have correct phase mappings and bounds", () => {
    expect(PHASES).toBeDefined();
    expect(PHASES.length).toBeGreaterThan(0);

    // Verify first phase starts on Day 1
    expect(PHASES[0].dayStart).toBe(1);

    // Verify last phase ends on Day 100
    expect(PHASES[PHASES.length - 1].dayEnd).toBe(100);

    // Verify phase intervals do not overlap and are contiguous
    for (let i = 0; i < PHASES.length - 1; i++) {
      expect(PHASES[i].dayEnd + 1).toBe(PHASES[i + 1].dayStart);
    }
  });

  it("should have exactly 6 daily inputs for progress tracking", () => {
    expect(DAILY_INPUTS).toBeDefined();
    expect(DAILY_INPUTS.length).toBe(6);

    // Verify each daily input has a unique id and standard properties
    const ids = DAILY_INPUTS.map((input) => input.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(6);
  });

  it("should have the correct list of hard rules defined", () => {
    expect(HARD_RULES).toBeDefined();
    expect(HARD_RULES.length).toBeGreaterThan(0);
  });

  it("should have a complete 100-day schedule", () => {
    expect(HUNDRED_DAY_SCHEDULE).toBeDefined();
    expect(HUNDRED_DAY_SCHEDULE.length).toBe(100);

    // Verify days are 1 to 100 in sequence
    for (let i = 0; i < HUNDRED_DAY_SCHEDULE.length; i++) {
      expect(HUNDRED_DAY_SCHEDULE[i].day).toBe(i + 1);
    }
  });
});
