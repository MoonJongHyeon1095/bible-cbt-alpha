import type { CognitiveBehaviorId } from "../../../../constants/behaviors";
import { COGNITIVE_BEHAVIORS } from "../../../../constants/behaviors";

export type BehaviorMeta = (typeof COGNITIVE_BEHAVIORS)[number];

export type BehaviorReviewItem = {
  behavior: BehaviorMeta;
  tags: string[];
};

export type BehaviorSelection = {
  behaviorId: CognitiveBehaviorId;
  behaviorLabel: string;
  behaviorText: string;
};

export type BehaviorSuggestionMap = Partial<
  Record<CognitiveBehaviorId, string>
>;

export type BehaviorErrorMap = Partial<
  Record<CognitiveBehaviorId, string | null>
>;
