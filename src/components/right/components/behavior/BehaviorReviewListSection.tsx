import type { CognitiveBehaviorId } from "../../../../constants/behaviors";
import { Accordion } from "../../../ui/accordion";
import type {
  BehaviorErrorMap,
  BehaviorReviewItem,
  BehaviorSelection,
  BehaviorSuggestionMap,
} from "./behaviorReviewTypes";
import { BehaviorReviewItemSection } from "./BehaviorReviewItemSection";

export function BehaviorReviewListSection({
  behaviorList,
  selectedBehaviorId,
  onSelectBehavior,
  suggestionsById,
  loadingId,
  errorAll,
  errorById,
  regenerateOne,
  suggestionsEnabled,
}: {
  behaviorList: BehaviorReviewItem[];
  selectedBehaviorId: CognitiveBehaviorId | null;
  onSelectBehavior: (behavior: BehaviorSelection | null) => void;
  suggestionsById: BehaviorSuggestionMap;
  loadingId: "all" | CognitiveBehaviorId | null;
  errorAll: string | null;
  errorById: BehaviorErrorMap;
  regenerateOne: (behaviorId: CognitiveBehaviorId) => void;
  suggestionsEnabled: boolean;
}) {
  return (
    <Accordion type="multiple" className="w-full space-y-3">
      {behaviorList.map((item) => (
        <BehaviorReviewItemSection
          key={item.behavior.id}
          item={item}
          selectedBehaviorId={selectedBehaviorId}
          onSelectBehavior={onSelectBehavior}
          suggestionsById={suggestionsById}
          loadingId={loadingId}
          errorAll={errorAll}
          errorById={errorById}
          regenerateOne={regenerateOne}
          suggestionsEnabled={suggestionsEnabled}
        />
      ))}
    </Accordion>
  );
}
