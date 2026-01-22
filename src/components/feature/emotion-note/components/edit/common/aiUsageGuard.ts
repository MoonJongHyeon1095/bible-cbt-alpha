import { toast } from "sonner";
import { fetchTokenUsageStatus } from "../../../../../../utils/tokenSessionStorage";

const MEMBER_DAILY_LIMIT = 20000;
const MEMBER_MONTHLY_LIMIT = 150000;
const GUEST_DAILY_LIMIT = 15000;
const GUEST_MONTHLY_LIMIT = 50000;

export async function checkAiUsageLimit() {
  try {
    const status = await fetchTokenUsageStatus();
    const dailyLimit = status.is_member ? MEMBER_DAILY_LIMIT : GUEST_DAILY_LIMIT;
    const monthlyLimit = status.is_member
      ? MEMBER_MONTHLY_LIMIT
      : GUEST_MONTHLY_LIMIT;

    if (status.usage.daily_usage >= dailyLimit) {
      toast.error("당일 토큰 사용량을 초과했습니다. (KST 09:00 기준 초기화)");
      return false;
    }

    if (status.usage.monthly_usage >= monthlyLimit) {
      toast.error("월 토큰 사용량을 초과했습니다. (KST 09:00 기준 초기화)");
      return false;
    }
  } catch (error) {
    console.error("token usage check failed:", error);
  }

  return true;
}
