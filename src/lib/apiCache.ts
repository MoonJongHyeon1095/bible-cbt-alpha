// // API 캐시 관리 - 동일한 요청의 중복 호출 방지
// interface CacheEntry {
//   data: any;
//   timestamp: number;
// }

// class APICache {
//   private cache: Map<string, CacheEntry> = new Map();
//   private readonly TTL = 5 * 60 * 1000; // 5분 캐시

//   private generateKey(functionName: string, ...args: any[]): string {
//     return `${functionName}:${JSON.stringify(args)}`;
//   }

//   get(functionName: string, ...args: any[]): any | null {
//     const key = this.generateKey(functionName, ...args);
//     const entry = this.cache.get(key);

//     if (!entry) return null;

//     // TTL 확인
//     if (Date.now() - entry.timestamp > this.TTL) {
//       this.cache.delete(key);
//       return null;
//     }

//     console.log(`✓ 캐시 히트: ${functionName}`);
//     return entry.data;
//   }

//   set(functionName: string, data: any, ...args: any[]): void {
//     const key = this.generateKey(functionName, ...args);
//     this.cache.set(key, {
//       data,
//       timestamp: Date.now(),
//     });
//   }

//   clear(): void {
//     this.cache.clear();
//   }

//   // 오래된 캐시 정리
//   cleanup(): void {
//     const now = Date.now();
//     for (const [key, entry] of this.cache.entries()) {
//       if (now - entry.timestamp > this.TTL) {
//         this.cache.delete(key);
//       }
//     }
//   }
// }

// export const apiCache = new APICache();

// // 주기적으로 오래된 캐시 정리 (10분마다)
// setInterval(() => {
//   apiCache.cleanup();
// }, 10 * 60 * 1000);
