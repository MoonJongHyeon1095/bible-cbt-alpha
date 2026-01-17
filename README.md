# Bible Cognitive Therapy - 마음생각 다시 쓰기

### 역할 접미사 예시

Page: 화면 진입점 PrayerNotesPage
View/Section: 큰 블록 PrayerNoteResponsesSection
List: 컬렉션 렌더 PrayerNoteList
Item/Card: 단일 엔티티 PrayerNoteCard
Form: 입력/편집 PrayerNoteForm
Empty/State: 상태 표시 PrayerNoteEmptyState
Modal/Sheet: 오버레이 PrayerNoteEditModal

### 재사용 컴포넌트 네이밍

도메인 비종속이면 NoteList, TagSelector처럼 범용
도메인 종속이면 PrayerNoteTagSelector처럼 접두사 고정

### 훅 네이밍

usePrayerNotes, usePrayerNoteResponses처럼 단수/복수 정확히
상태만 가진 훅: usePrayerNoteForm
데이터/IO 훅: usePrayerNotesApi 또는 usePrayerNotes로 통일
