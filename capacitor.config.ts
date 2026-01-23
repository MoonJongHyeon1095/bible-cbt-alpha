import type { CapacitorConfig } from "@capacitor/cli";

const env = process.env.CBT_ENV ?? "prod";  // prod | release | local
const appId =
  env === "release"
    ? "com.alliance617.cbt.release"
    : env === "local"
      ? "com.alliance617.cbt.local"
      : "com.alliance617.cbt";

const appName =
  env === "release"
    ? "CBT Tool (Release)"
    : env === "local"
      ? "CBT Tool (Local)"
      : "Cognitive Behavioral Therapy Tool";

const config: CapacitorConfig = {
  appId:  appId,
  appName: appName,
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

npx @capacitor/assets generate --ios --android --assetPath resources
 
npm run dev -- --host 0.0.0.0 --port 5173
*/
/**
npm run build:release
npm run sync:android:release
 */