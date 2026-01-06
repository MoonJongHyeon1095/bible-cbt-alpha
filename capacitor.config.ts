import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.cbt",
  appName: "Cognitive Behavioral Therapy Tool",
  webDir: "dist",
  // 로컬 테스트가 아니면 server 설정 주석 처리
  // server: {
  //   url: "http://10.0.2.2:5173", // Android 에뮬레이터가 “호스트 PC(Windows)”에 접근할 때 쓰는 고정 주소
  //   cleartext: true, // http 접속 허용
  // },
};

export default config;

/**
 * 
nvm use 22
npm run build   
npx cap sync android
rsync -a --delete ~/bible-cbt-alpha/android/ /mnt/d/tmp/bible-cbt-android/ 

mkdir -p /mnt/d/tmp/node_modules/@capacitor
rsync -a --delete ~/bible-cbt-alpha/node_modules/@capacitor/ /mnt/d/tmp/node_modules/@capacitor/
 
npm run dev -- --host 0.0.0.0 --port 5173
*/