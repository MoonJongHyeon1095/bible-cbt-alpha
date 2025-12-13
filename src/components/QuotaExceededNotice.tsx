import { AlertCircle, Clock, ExternalLink } from 'lucide-react';

interface QuotaExceededNoticeProps {
  retryAfterMinutes?: number;
  onClose?: () => void;
}

export function QuotaExceededNotice({ 
  retryAfterMinutes, 
  onClose 
}: QuotaExceededNoticeProps) {
  const retryMessage = retryAfterMinutes && retryAfterMinutes > 60
    ? '내일'
    : retryAfterMinutes
    ? `약 ${Math.ceil(retryAfterMinutes)}분 후`
    : '잠시 후';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6">
        {/* 헤더 */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 size-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="size-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-900 mb-1">
              AI 서버 사용량 초과
            </h3>
            <p className="text-slate-600 text-sm">
              무료 API의 일일 사용량을 초과했습니다
            </p>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="space-y-3 bg-amber-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 space-y-2">
              <p>
                {retryMessage}에 다시 시도해주세요.
              </p>
              <p>
                AI 기능은 일시적으로 사용할 수 없지만, 입력하신 내용을 기본 분석 결과와 함께 저장하고 계속 진행하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 해결 방법 */}
        <div className="space-y-3">
          <h4 className="text-sm text-slate-700">
            💡 더 많이 사용하시려면:
          </h4>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              1. <a 
                href="https://aistudio.google.com/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline inline-flex items-center gap-1"
              >
                Google AI Studio
                <ExternalLink className="size-3" />
              </a>에서 무료 API 키를 새로 발급받으세요
            </p>
            <p>
              2. 발급받은 API 키를 관리자에게 전달하여 설정을 업데이트하세요
            </p>
            <p className="text-xs text-slate-500 mt-2">
              * Google Gemini API는 무료 티어에서도 충분한 사용량을 제공합니다
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            기본 분석으로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
