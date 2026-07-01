/**
 * PointsPolicy — the loyalty earning rule, extracted from YSPOS23
 * PKG_POS_POINT_PKG.Get_Point_Cnt (proof: db/schema/plsql/PKG_POS_POINT_PKG.sql,
 * lines 231-290).
 *
 *   calc-type 1: points = billAmount / AMT_4POINT
 *   calc-type 2: points = (billAmount / AMT_4POINT) * POINT_CNT
 *   Both are TRUNC'd to whole points when TRUNCATE_FLAG = 1 (the common config;
 *   Onyx checks Ias_Para_Ar.Point_Calc_Typ = 0 → TRUNC).
 *
 * We only implement the two amount-proportional calc types (1,2) — the tier
 * (3) and per-group (4) types require master tables that are EMPTY in this
 * environment. AMT_4POINT etc. come from our LOYALTY_CONFIG overlay.
 */
export interface LoyaltyRule {
  calcType: number; // 1 | 2
  amt4Point: number; // riyals per point / per unit
  pointCnt: number; // points per unit (calc 2)
  truncate: boolean;
  pointValue: number; // monetary value of 1 point (redeem)
}

export interface EarnResult {
  points: number;
  docAmt: number;
}

/** Compute earned points for a bill amount under a loyalty rule. */
export function earnPoints(billAmount: number, rule: LoyaltyRule): EarnResult {
  if (!(billAmount > 0) || !(rule.amt4Point > 0)) {
    return { points: 0, docAmt: billAmount > 0 ? billAmount : 0 };
  }
  let raw: number;
  if (rule.calcType === 2) {
    raw = (billAmount / rule.amt4Point) * rule.pointCnt;
  } else {
    // calc-type 1 (default): one point block per AMT_4POINT riyals.
    raw = billAmount / rule.amt4Point;
  }
  const points = rule.truncate ? Math.trunc(raw) : round4(raw);
  return { points, docAmt: billAmount };
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
