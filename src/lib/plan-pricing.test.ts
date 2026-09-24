import { describe, expect, it } from "vitest";
import { bestValueDays, pricePerDay } from "./plan-pricing";

describe("bestValueDays", () => {
  it("Premium: 15 días es el mejor precio por día, no 30", () => {
    const premium = { 7: 1799, 15: 3299, 30: 6999 };
    expect(pricePerDay(3299, 15)).toBe(220);
    expect(pricePerDay(6999, 30)).toBe(233);
    expect(bestValueDays(premium)).toBe(15);
  });
  it("cuando 30 días es realmente más barato por día, lo marca", () => {
    expect(bestValueDays({ 7: 699, 15: 1299, 30: 2499 })).toBe(30);
  });
  it("en empate gana la duración más larga", () => {
    expect(bestValueDays({ 10: 1000, 20: 2000 })).toBe(20);
  });
});
