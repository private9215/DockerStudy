# 간단한 투두리스트

React + NestJS + PostgreSQL. 별도 CSS 없이 기본 HTML 요소만 사용합니다.

- 할 일 추가 (최대 200자)
- 목록 조회
- 할 일 내용 수정 / 저장 / 취소
- 완료 체크 / 해제
- 삭제

## 실행

Docker Desktop을 실행한 뒤 프로젝트 폴더에서:

```sh
docker compose up --build -d
```

브라우저에서 http://localhost:3000 에 접속합니다.

```sh
docker compose down
```

종료해도 할 일은 PostgreSQL 볼륨에 보존됩니다. `docker compose down -v`는 저장된 데이터까지 삭제합니다.

## 구조

- `frontend/`: React + TypeScript + Vite, Nginx가 정적 파일과 API 프록시 제공
- `backend/`: NestJS + TypeScript, `pg`로 PostgreSQL 연결
- `compose.yaml`: 프론트엔드, 백엔드, PostgreSQL 실행 구성

DB 테이블은 백엔드 시작 시 자동 생성됩니다. 로그인 없는 로컬 학습용이며 DB 접속 정보도 로컬 예시입니다.

## API

| 메서드 | 경로 | 요청 본문 |
| --- | --- | --- |
| GET | `/api/todos` | 없음 |
| POST | `/api/todos` | `{"title":"할 일"}` |
| PATCH | `/api/todos/:id` | `{"completed":true}` |
| PATCH | `/api/todos/:id/title` | `{"title":"수정한 할 일"}` |
| DELETE | `/api/todos/:id` | 없음 |
