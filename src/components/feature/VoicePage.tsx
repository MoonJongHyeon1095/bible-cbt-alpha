import { AlertCircle, Mic, MicOff, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Web Speech API 지원 확인
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "ko-KR";

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript((prev) => prev + finalTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("음성 인식 오류:", event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, []);

  const startRecording = () => {
    if (recognition) {
      setTranscript("");
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript).then(() => {
      alert("텍스트가 클립보드에 복사되었습니다!");
    });
  };

  const handleUseCBT = () => {
    // CBT 페이지로 이동하면서 텍스트 전달
    localStorage.setItem("voice_input_text", transcript);
    alert("CBT 세션으로 이동합니다. 입력된 텍스트를 사용할 수 있습니다.");
  };

  return (
    <div className="max-w-[1000px] mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl text-slate-900 mb-2 flex items-center gap-3">
          <Mic className="size-8 text-purple-600" />
          음성 입력
        </h1>
        <p className="text-slate-600">
          말로 경험을 입력하고 마음생각고쳐쓰기에서 사용하세요.
        </p>
      </div>

      {!isSupported ? (
        <Card className="p-12 text-center bg-red-50 border-red-200">
          <AlertCircle className="size-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-700 text-lg mb-2">
            음성 인식이 지원되지 않는 브라우저입니다.
          </p>
          <p className="text-red-600 text-sm">
            Chrome, Edge, Safari 등 최신 브라우저를 사용해주세요.
          </p>
        </Card>
      ) : (
        <>
          {/* 녹음 컨트롤 */}
          <Card className="p-8 mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <div className="flex flex-col items-center gap-6">
              <div
                className={`size-32 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? "bg-red-600 animate-pulse"
                    : "bg-gradient-to-r from-red-600 to-pink-600"
                }`}
              >
                {isRecording ? (
                  <MicOff className="size-16 text-white" />
                ) : (
                  <Mic className="size-16 text-white" />
                )}
              </div>

              <div className="text-center">
                <p className="text-lg text-slate-900 mb-2">
                  {isRecording ? "🎤 녹음 중..." : "준비됨"}
                </p>
                <p className="text-sm text-slate-600">
                  {isRecording
                    ? "말씀하세요. 자동으로 텍스트로 변환됩니다."
                    : "마이크 버튼을 눌러 녹음을 시작하세요."}
                </p>
              </div>

              <div className="flex gap-3">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  >
                    <Play className="size-5 mr-2" />
                    녹음 시작
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Square className="size-5 mr-2" />
                    녹음 중지
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* 변환된 텍스트 */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">변환된 텍스트</h3>

            {transcript ? (
              <>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {transcript}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    📋 복사하기
                  </Button>
                  <Button
                    onClick={handleUseCBT}
                    disabled={!transcript}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    마음생각고쳐쓰기에서 사용하기
                  </Button>
                  <Button
                    onClick={() => setTranscript("")}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    지우기
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
                <Mic className="size-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">아직 녹음된 내용이 없습니다.</p>
              </div>
            )}
          </Card>

          {/* 사용 팁 */}
          <Card className="p-5 mt-6 bg-blue-50 border-blue-200">
            <h4 className="text-sm text-blue-900 mb-2">💡 사용 팁</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>조용한 환경에서 녹음하면 정확도가 높아집니다.</li>
              <li>또박또박 천천히 말씀하세요.</li>
              <li>긴 이야기는 여러 번 나눠서 녹음하는 것이 좋습니다.</li>
              <li>변환 후 필요시 텍스트를 수정할 수 있습니다.</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
