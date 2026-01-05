import {
  AlertCircle,
  Clock,
  Globe,
  LifeBuoy,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function HelplinePage() {
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
    <div className="max-w-[1200px] mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
          <LifeBuoy className="size-8 text-red-600" />
          긴급 헬프라인
        </h1>
        <p className="text-slate-600">
          위기 상황에서 도움을 받을 수 있는 전화번호와 자원입니다.
        </p>
      </div>

      {/* 긴급 안내 */}
      <Card className="p-6 mb-8 bg-red-50 border-2 border-red-300">
        <div className="flex gap-4">
          <AlertCircle className="size-8 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg text-red-900 mb-2">⚠️ 긴급 상황이신가요?</h3>
            <p className="text-red-800 mb-3">
              지금 당장 자신이나 타인을 해칠 위험이 있다면, 즉시 아래 긴급
              전화로 연락하세요.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => (window.location.href = "tel:112")}
                className="bg-red-600 hover:bg-red-700"
              >
                <Phone className="size-5 mr-2" />
                112 (경찰)
              </Button>
              <Button
                onClick={() => (window.location.href = "tel:119")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Phone className="size-5 mr-2" />
                119 (응급)
              </Button>
            </div>
          </div>
        </div>
      </Card>

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
              ��께 기도해줄 공동체 찾기
            </p>
            <p className="text-sm text-slate-500">🔗 준비 중입니다...</p>
          </div>
        </div>
      </Card>

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
    </div>
  );
}
