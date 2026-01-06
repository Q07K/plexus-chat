export default {
    legend: {
        user: '사용자',
        ai: 'AI',
        synthesis: '종합',
        system: '시스템',
        active: '활성'
    },
    synthesis: {
        mode: '종합 모드',
        on: 'ON',
        off: 'OFF',
        toggleTooltip: '종합 모드 전환',
        placeholder: '종합 질문을 입력하세요...',
        status: {
            synthesizing: '인사이트 종합 중...'
        },
        context: '종합 컨텍스트',
        intro: '선택된 다음 대화 맥락들이 종합에 사용됩니다:'
    },
    home: {
        title: 'Plexus Chat',
        subtitle: '연결. 병합. 확산.'
    },
    chat: {
        thread: '컨텍스트 스레드',
        selectNode: '대화 스레드를 보려면 노드를 선택하세요.',
        msgs: '메시지',
        input: {
            placeholder: '질문을 입력하세요...',
            send: '전송'
        },
        error: {
            apiKeyMissing: '설정에서 API 키를 먼저 설정해주세요!',
            generation: '응답 생성 오류: '
        },
        thinking: '생각 중...',
        synthesizing: '인사이트 종합 중...',
        contextMenu: {
            copy: '복사',
            saveImage: 'PNG로 저장'
        }
    },
    settings: {
        title: '설정',
        modelSelection: '모델 선택',
        apiKeys: 'API 키',
        openaiKey: 'OpenAI API 키',
        googleKey: 'Google Gemini API 키',
        hint: '키는 브라우저에 로컬로 저장됩니다.',
        language: '언어',
        tabs: {
            general: '일반',
            llm: 'LLM 설정',
            data: '데이터'
        },
        data: {
            title: '백업 및 복구',
            export: '대화 내보내기',
            import: '대화 불러오기',
            desc: '현재 대화 구성을 파일로 저장하거나 불러옵니다.',
            confirmLoad: '현재 대화가 대체됩니다. 계속하시겠습니까?',
            loadSuccess: '대화를 성공적으로 불러왔습니다!'
        },
        llm: {
            systemPrompt: '시스템 프롬프트',
            systemPromptPlaceholder: '유용한 도우미입니다...',
            parameters: '파라미터',
            temperature: '온도 (Temperature)',
            topK: 'Top K'
        }
    }
}
