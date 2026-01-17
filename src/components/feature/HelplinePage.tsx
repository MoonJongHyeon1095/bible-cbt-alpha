import { Clock, Globe, LifeBuoy, MessageCircle, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { CbtMode } from "../header/navigation/ModePicker";
import { FeatureHeader } from "./common/FeatureHeader";
import { ScrollToTopButton } from "./common/ScrollToTopButton";

type HelplinePageProps = {
  mode: CbtMode;
};

export function HelplinePage({ mode }: HelplinePageProps) {
  const helplines = [
    {
      name: "자살예방상담전화",
      phone: "1393",
      description: "24시간 상담 가능",
      available: "24시간",
      icon: Phone,
    },
    {
      name: "정신건강위기상담전화",
      phone: "1577-0199",
      description: "24시간 정신건강 위기 상담",
      available: "24시간",
      icon: Phone,
    },
    {
      name: "희망의 전화",
      phone: "129",
      description: "보건복지상담센터",
      available: "24시간",
      icon: Phone,
    },
    {
      name: "청소년 전화",
      phone: "1388",
      description: "청소년 상담 및 긴급구조",
      available: "24시간",
      icon: Phone,
    },
  ];

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      <FeatureHeader
        overline="Helpline"
        title="긴급 헬프라인"
        subtitle="위기 상황에서 도움을 받을 수 있는 전화번호와 자원입니다."
        icon={LifeBuoy}
        iconClassName="text-red-600"
      />

      {/* 상담 전화 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {helplines.map((helpline) => {
          const Icon = helpline.icon;
          return (
            <Card
              key={helpline.phone}
              className="p-6 hover:shadow-lg transition-shadow border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full size-12 flex items-center justify-center flex-shrink-0">
                  <Icon className="size-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-slate-900 mb-1">
                    {helpline.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {helpline.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="size-4 text-slate-500" />
                    <span className="text-sm text-slate-600">
                      {helpline.available}
                    </span>
                  </div>
                  <Button
                    onClick={() =>
                      (window.location.href = `tel:${helpline.phone}`)
                    }
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <Phone className="size-4 mr-2" />
                    {helpline.phone}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 온라인 자원 */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Globe className="size-6 text-purple-600" />
          온라인 자원
        </h3>
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-slate-900 mb-1">마음의 온도 체크</h4>
            <p className="text-sm text-slate-600 mb-2">
              정신건강 자가진단 및 관리 서비스
            </p>
            <p className="text-sm text-slate-500">🔗 준비 중입니다...</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-slate-900 mb-1">온라인 상담 채팅</h4>
            <p className="text-sm text-slate-600 mb-2">
              전문 상담사와 1:1 채팅 상담
            </p>
            <p className="text-sm text-slate-500">🔗 준비 중입니다...</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="text-slate-900 mb-1">
              가까운 정신건강복지센터 찾기
            </h4>
            <p className="text-sm text-slate-600 mb-2">
              내 지역의 정신건강 지원 기관
            </p>
            <p className="text-sm text-slate-500">🔗 준비 중입니다...</p>
          </div>
        </div>
      </Card>

      {/* 기독교 상담 자원 */}
      {mode.toneMode === "christian" && (
        <Card className="p-6 bg-purple-50 border-purple-200">
          <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
            <MessageCircle className="size-6 text-purple-600" />
            기독교 상담 자원
          </h3>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h4 className="text-slate-900 mb-1">기독교 상담센터</h4>
              <p className="text-sm text-slate-600 mb-2">
                기독교 관점의 전문 심리 상담
              </p>
              <p className="text-sm text-slate-500">🔗 준비 중입니다...</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h4 className="text-slate-900 mb-1">교회 내 상담 프로그램</h4>
              <p className="text-sm text-slate-600 mb-2">
                소속 교회의 목회 상담 및 치유 사역 연결
              </p>
              <p className="text-sm text-slate-500">🔗 준비 중입니다...</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h4 className="text-slate-900 mb-1">온라인 기도 요청</h4>
              <p className="text-sm text-slate-600 mb-2">
                함께 기도해줄 공동체 찾기
              </p>
              <p className="text-sm text-slate-500">🔗 준비 중입니다...</p>
            </div>
          </div>
        </Card>
      )}

      {/* 안내 메시지 */}
      <Card className="p-5 mt-8 bg-blue-50 border-blue-200">
        <h4 className="text-sm text-blue-900 mb-2">💙 알아두세요</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>도움을 요청하는 것은 용기있는 행동입니다.</li>
          <li>전문가의 도움이 필요하다면 주저하지 말고 연락하세요.</li>
          <li>모든 상담은 비밀이 보장됩니다.</li>
          <li>당신은 혼자가 아닙니다. 함께 이겨낼 수 있습니다.</li>
        </ul>
      </Card>
      <ScrollToTopButton />
    </div>
  );
}
