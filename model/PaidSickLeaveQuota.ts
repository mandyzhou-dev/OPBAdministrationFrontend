export interface PaidSickLeaveQuota {
  username: string;
  year: number;
  usedDays: number;
  quotaDays: number;
  probation: boolean;
  eligible: boolean;
  targetDateAlreadyCounted: boolean;
  canMarkPaidSickLeave: boolean;
  message?: string;
}
