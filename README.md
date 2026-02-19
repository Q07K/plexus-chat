# Plexus-Chat: 비선형적 유기적 지식 대화 플랫폼

> **"Linear Thought to Organic Network"** (선형적 사고에서 유기적 네트워크로)
<img width="2880" height="1800" alt="image" src="https://github.com/user-attachments/assets/219d5211-def5-4570-bccb-cb7df622173b" />

<div align="center">

  <a href="https://q07k.github.io/plexus-chat">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit%20Site-62aa62?style=for-the-badge&logo=github&logoColor=white" alt="Live Demo" />
  </a>
  &nbsp;
  <a href="https://youtu.be/DKdg9bM5OQE?si=x8p-S4BkNS7sk7-W">
    <img src="https://img.shields.io/badge/YouTube-Concept%20%26%20Walkthrough-dd6262?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube Video" />
  </a>

</div>

## 1. 서비스 개요
**Plexus**는 '망', '신경 다발'이라는 어원에서 알 수 있듯이, 척추 신경 등이 복잡하게 얽혀 있는 네트워크를 의미합니다.
</br>
**Plexus-Chat**은 기존 LLM 인터페이스의 선형적(Linear) 한계를 넘어, 인간의 사고가 꼬리에 꼬리를 물고 이어지며(Divergence), 흩어진 생각들이 다시 하나로 합쳐져 통찰을 만들어내는(Convergence) 
**'뇌의 신경망'** 구조를 대화 인터페이스에 구현한 프로젝트입니다.

### 기획 배경
기존의 ChatGPT, Claude 등은 하나의 타임라인에서만 대화가 진행되어, 다른 주제로 파생되거나 과거의 맥락을 병합하는 데 어려움이 있었습니다.
</br>
Plexus-Chat은 이러한 선형적 구조를 탈피하여 유기적인 지식 탐색을 가능하게 합니다.

## 2. 핵심 가치 (Core Values)
- **Divergence (발산)**: 하나의 질문에서 여러 갈래로 뻗어나가는 가지치기(Branching)
- **Convergence (수렴)**: 흩어진 정보(Endpoint)들을 하나로 엮어 새로운 통찰을 도출(Synthesis)
- **Visualization (시각화)**: 대화의 흐름을 직관적인 그래프로 파악하고 탐색

## 3. 주요 기능 (Key Features)

### 3.1 Infinite Graph Canvas (무한 그래프 캔버스)
- **기능**: 스크롤이 아닌 마우스 드래그(Pan)와 휠(Zoom)을 통해 탐색하는 무한 캔버스 UI.
- **시각화**: 모든 질문(User)과 답변(Assistant)을 노드와 링크로 시각화.
- **인터랙션**: 노드 클릭 시 해당 시점으로 이동하며 컨텍스트 동기화. 좌측 상단 Legend를 통해 노드 상태 구분.

### 3.2 Branching Interaction (대화 가지치기)
- **기능**: 과거의 특정 시점으로 돌아가 새로운 질문을 던져 대화 흐름을 분기.
- **시나리오**: A에 대한 답변을 듣고, B 관점으로 질문(Branch 1)하거나, 다시 A 답변에서 C 관점으로 질문(Branch 2)하여 시각적으로 분리된 가지 생성.

### 3.3 Synthesis Mode (종합 답변 모드)
- **기능**: 서로 다른 맥락의 대화 끝(Endpoint)을 모아 결론을 도출.
- **메커니즘**:
  - 모드 활성화 시 기존 선형 채팅창이 '종합 대화 모드'로 전환.
  - 모든 엔드포인트 노드(Leaf Nodes)가 활성화되어 참조 대상이 됨.
  - 질문 입력 시 활성화된 엔드포인트들의 컨텍스트가 **'종합 질문 노드'** 로 병합되고, LLM이 **'종합 답변 노드'** 를 생성.
  - 점선 링크(Reference Link)로 정보의 합류 표현.

## 4. 기술 스택 (Tech Stack)
- **Core**: Vue 3 (Composition API, `<script setup>`), TypeScript
- **State**: Pinia
- **Visualization**: D3.js (Force-directed graph)
- **Build**: Vite
- **Styling**: Vanilla CSS (Variables-based theming)

## 5. 프로젝트 구조 (Project Structure)
```
src/
  modules/
    core/           # Graph engine, store, main views
    conversation/   # Chat input, message logic
    synthesis/      # Synthesis mode logic and components
    ui/             # Shared UI components (Legend, buttons)
  shared/           # Utilities
  App.vue
  main.ts
```

## 6. 시작하기 (Getting Started)

### 사전 요구사항
- Node.js (Latest LTS 권장)
- npm

### 설치 및 실행
1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **프로덕션 빌드**
   ```bash
   npm run build
   ```

## 7. 사용 방법
- **Chat**: 채팅 입력창에 질문을 입력하여 User 노드를 생성하고 AI의 답변을 받습니다.
- **Branch**: 이전 노드를 클릭(금색 링 하이라이트)하여 선택한 후, 새로운 질문을 입력하면 해당 지점에서 가지가 뻗어나갑니다.
- **Merge/Synthesis**: 우측 상단 'Synthesis Mode'를 켜고, 흩어진 대화의 맥락을 종합하는 질문을 던져보세요.
