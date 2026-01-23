import type { User } from "@supabase/supabase-js";
import type { CbtMode } from "../header/navigation/ModePicker";

import { CBTSessionPage } from "../CBTSessionPage";
import { EnterancePage } from "../enterance/EnterancePage";
import { DashboardPage } from "../feature/dashboard/DashboardPage";
import { HelplinePage } from "../feature/HelplinePage";
import { PatternsPage } from "../feature/emotion-note/components/PatternsPage";
import { PrayerNotesPage } from "../feature/prayer-note/PrayerNotesPage";
import { MinimalSessionPage } from "../MinimalSessionPage";

type PageContentProps = {
  cbtResetKey: number;
  cbtSessionKind: "minimal" | "cbt";
  currentPage: string;
  isMinimalExiting: boolean;
  mode: CbtMode;
  showEnterance: boolean;
  showMinimalCbt: boolean;
  user: User | null;
  onCbtStepChange: (step: number) => void;
  onEnteranceComplete: () => void;
  onEnteranceLater: () => void;
  onMinimalComplete: () => void;
  onSessionKindChange: (next: "minimal" | "cbt") => void;
  onStartMinimalFromLite: () => void;
};

export function PageContent({
  cbtResetKey,
  cbtSessionKind,
  currentPage,
  isMinimalExiting,
  mode,
  showEnterance,
  showMinimalCbt,
  user,
  onCbtStepChange,
  onEnteranceComplete,
  onEnteranceLater,
  onMinimalComplete,
  onSessionKindChange,
  onStartMinimalFromLite,
}: PageContentProps) {
  switch (currentPage) {
    case "cbt":
      return showEnterance ? (
        <div className="animate-in fade-in-0 duration-300">
          <EnterancePage
            onStartSession={onEnteranceComplete}
            onExplore={onEnteranceComplete}
            onLater={onEnteranceLater}
          />
        </div>
      ) : showMinimalCbt ? (
        <div
          className={`animate-in fade-in-0 duration-300 ${
            isMinimalExiting ? "animate-out fade-out-0 duration-300" : ""
          }`}
        >
          <MinimalSessionPage
            mode={mode}
            user={user}
            onComplete={onMinimalComplete}
          />
        </div>
      ) : (
        <div className="animate-in fade-in-0 duration-300">
          <CBTSessionPage
            key={cbtResetKey}
            mode={mode}
            onStartMinimal={onStartMinimalFromLite}
            sessionKind={cbtSessionKind}
            onSessionKindChange={onSessionKindChange}
            user={user}
            onStepChange={onCbtStepChange}
          />
        </div>
      );

    case "dashboard":
      return <DashboardPage user={user} />;

    case "prayer-notes":
      return <PrayerNotesPage user={user} />;

    case "patterns":
      return <PatternsPage user={user} />;

    case "helpline":
      return <HelplinePage mode={mode} />;

    default:
      return (
        <CBTSessionPage
          mode={mode}
          onStartMinimal={onStartMinimalFromLite}
          sessionKind={cbtSessionKind}
          onSessionKindChange={onSessionKindChange}
          user={user}
        />
      );
  }
}
