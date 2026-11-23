export type RecoveryFieldErrors = Partial<Record<"mobile" | "code" | "password" | "confirmation", string>>;

export function getRecoveryMobileError(mobile: string) {
  if (!/^09\d{9}$/.test(mobile)) {
    return "شماره موبایل را با فرمت ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.";
  }
}

export function getRecoveryResetErrors(code: string, password: string, confirmation: string) {
  const errors: RecoveryFieldErrors = {};
  if (!/^\d{4}$/.test(code)) errors.code = "کد بازیابی باید ۴ رقم باشد.";
  if (typeof password !== "string" || password.length < 8) {
    errors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  }
  if (!confirmation) {
    errors.confirmation = "تکرار رمز عبور را وارد کنید.";
  } else if (password !== confirmation) {
    errors.confirmation = "رمز عبور و تکرار آن باید یکسان باشند.";
  }
  return errors;
}
