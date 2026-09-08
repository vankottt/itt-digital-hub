import { describe, expect, it } from "vitest";
import { people, publicTeamList, teamUpcomingCount, joinSlotCount, linkedInHref } from "../src/content/people";

describe("public team", () => {
  it("lists the two complementary specialists", () => {
    expect(people.map((p) => p.slug)).toEqual(["ivan-todorov", "ivan-tomchev"]);
    expect(people[0]?.portrait?.src).toBe("/images/team/ivan-todorov-portrait-v2.png");
    expect(people[0]?.name.en).toBe("Ivan Todorov");
    expect(people[0]?.role?.en).toBe("Business Systems & AI Solutions Consultant");
    expect(people[1]?.name.en).toBe("Ivan Tomchev");
    expect(people[1]?.role?.en).toBe("AI Systems Architect & Software Engineer");
    expect(people[1]?.portrait).toBeUndefined();
  });

  it("keeps seed order when CMS returns the same people shuffled", () => {
    const shuffled = [people[1]!, people[0]!];
    expect(publicTeamList(shuffled).map((p) => p.slug)).toEqual(["ivan-todorov", "ivan-tomchev"]);
  });

  it("does not reserve a join-us vacancy on the public site", () => {
    expect(teamUpcomingCount).toBe(0);
    expect(joinSlotCount(people)).toBe(0);
  });

  it("exposes a LinkedIn URL only when it is confirmed", () => {
    expect(linkedInHref(people[0]!)).toBe("https://www.linkedin.com/in/ivan-todorov-30152428/");
    expect(linkedInHref(people[1]!)).toBeUndefined();
  });
});
