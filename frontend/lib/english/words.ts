export interface Word {
    word: string
    phonetic: string
    pos: string        // part of speech
    zh: string
    ko: string
    example: string
    exampleZh: string
    exampleKo: string
    category: string
    difficulty: 1 | 2 | 3  // 1=beginner, 2=intermediate, 3=advanced
}

export const CATEGORIES = ['Tech', 'Business', 'Daily', 'Academic', 'Travel', 'Food', 'Emotion', 'Work'] as const

export const WORD_BANK: Word[] = [
    // ---- Tech ----
    { word: 'algorithm', phonetic: '/ˈælɡəˌrɪðəm/', pos: 'n.', zh: '算法', ko: '알고리즘', example: 'This sorting algorithm is very efficient.', exampleZh: '这个排序算法非常高效。', exampleKo: '이 정렬 알고리즘은 매우 효율적입니다.', category: 'Tech', difficulty: 2 },
    { word: 'bandwidth', phonetic: '/ˈbændwɪdθ/', pos: 'n.', zh: '带宽', ko: '대역폭', example: 'We need more bandwidth for video streaming.', exampleZh: '视频流需要更多带宽。', exampleKo: '비디오 스트리밍에 더 많은 대역폭이 필요합니다.', category: 'Tech', difficulty: 2 },
    { word: 'compile', phonetic: '/kəmˈpaɪl/', pos: 'v.', zh: '编译', ko: '컴파일하다', example: 'The code failed to compile.', exampleZh: '代码编译失败了。', exampleKo: '코드가 컴파일에 실패했습니다.', category: 'Tech', difficulty: 2 },
    { word: 'debug', phonetic: '/diːˈbʌɡ/', pos: 'v.', zh: '调试', ko: '디버그하다', example: 'I spent hours debugging this issue.', exampleZh: '我花了几个小时调试这个问题。', exampleKo: '이 문제를 디버깅하는 데 몇 시간을 보냈습니다.', category: 'Tech', difficulty: 1 },
    { word: 'deploy', phonetic: '/dɪˈplɔɪ/', pos: 'v.', zh: '部署', ko: '배포하다', example: 'We will deploy the update tonight.', exampleZh: '我们今晚将部署更新。', exampleKo: '오늘 밤 업데이트를 배포할 예정입니다.', category: 'Tech', difficulty: 2 },
    { word: 'deprecated', phonetic: '/ˈdeprəkeɪtɪd/', pos: 'adj.', zh: '已弃用的', ko: '더 이상 사용되지 않는', example: 'This API method is deprecated.', exampleZh: '这个API方法已被弃用。', exampleKo: '이 API 메서드는 더 이상 사용되지 않습니다.', category: 'Tech', difficulty: 3 },
    { word: 'encrypt', phonetic: '/ɪnˈkrɪpt/', pos: 'v.', zh: '加密', ko: '암호화하다', example: 'Always encrypt sensitive data.', exampleZh: '始终加密敏感数据。', exampleKo: '민감한 데이터는 항상 암호화하세요.', category: 'Tech', difficulty: 2 },
    { word: 'framework', phonetic: '/ˈfreɪmwɜːrk/', pos: 'n.', zh: '框架', ko: '프레임워크', example: 'React is a popular JavaScript framework.', exampleZh: 'React是一个流行的JavaScript框架。', exampleKo: 'React는 인기 있는 JavaScript 프레임워크입니다.', category: 'Tech', difficulty: 1 },
    { word: 'implement', phonetic: '/ˈɪmplɪment/', pos: 'v.', zh: '实现', ko: '구현하다', example: 'We need to implement this feature by Friday.', exampleZh: '我们需要在周五之前实现这个功能。', exampleKo: '금요일까지 이 기능을 구현해야 합니다.', category: 'Tech', difficulty: 2 },
    { word: 'iterate', phonetic: '/ˈɪtəreɪt/', pos: 'v.', zh: '迭代', ko: '반복하다', example: 'Let\'s iterate on the design.', exampleZh: '让我们对设计进行迭代。', exampleKo: '디자인을 반복 개선합시다.', category: 'Tech', difficulty: 2 },
    { word: 'latency', phonetic: '/ˈleɪtənsi/', pos: 'n.', zh: '延迟', ko: '지연 시간', example: 'Low latency is critical for gaming.', exampleZh: '低延迟对游戏至关重要。', exampleKo: '게임에서는 낮은 지연 시간이 중요합니다.', category: 'Tech', difficulty: 2 },
    { word: 'middleware', phonetic: '/ˈmɪdəlwer/', pos: 'n.', zh: '中间件', ko: '미들웨어', example: 'Add authentication middleware to the router.', exampleZh: '在路由器上添加认证中间件。', exampleKo: '라우터에 인증 미들웨어를 추가하세요.', category: 'Tech', difficulty: 3 },
    { word: 'optimize', phonetic: '/ˈɑːptɪmaɪz/', pos: 'v.', zh: '优化', ko: '최적화하다', example: 'We need to optimize the database queries.', exampleZh: '我们需要优化数据库查询。', exampleKo: '데이터베이스 쿼리를 최적화해야 합니다.', category: 'Tech', difficulty: 2 },
    { word: 'parameter', phonetic: '/pəˈræmɪtər/', pos: 'n.', zh: '参数', ko: '매개변수', example: 'Pass the user ID as a parameter.', exampleZh: '将用户ID作为参数传递。', exampleKo: '사용자 ID를 매개변수로 전달하세요.', category: 'Tech', difficulty: 1 },
    { word: 'repository', phonetic: '/rɪˈpɑːzɪtɔːri/', pos: 'n.', zh: '仓库', ko: '리포지토리', example: 'Clone the repository from GitHub.', exampleZh: '从GitHub克隆仓库。', exampleKo: 'GitHub에서 리포지토리를 클론하세요.', category: 'Tech', difficulty: 1 },
    { word: 'refactor', phonetic: '/riːˈfæktər/', pos: 'v.', zh: '重构', ko: '리팩토링하다', example: 'It\'s time to refactor this legacy code.', exampleZh: '是时候重构这段遗留代码了。', exampleKo: '이 레거시 코드를 리팩토링할 때입니다.', category: 'Tech', difficulty: 2 },
    { word: 'scalable', phonetic: '/ˈskeɪləbəl/', pos: 'adj.', zh: '可扩展的', ko: '확장 가능한', example: 'The architecture must be scalable.', exampleZh: '架构必须是可扩展的。', exampleKo: '아키텍처는 확장 가능해야 합니다.', category: 'Tech', difficulty: 2 },
    { word: 'synchronize', phonetic: '/ˈsɪŋkrənaɪz/', pos: 'v.', zh: '同步', ko: '동기화하다', example: 'Synchronize your local branch with remote.', exampleZh: '将本地分支与远程同步。', exampleKo: '로컬 브랜치를 원격과 동기화하세요.', category: 'Tech', difficulty: 2 },
    { word: 'thread', phonetic: '/θred/', pos: 'n.', zh: '线程', ko: '스레드', example: 'Run the task on a background thread.', exampleZh: '在后台线程上运行任务。', exampleKo: '백그라운드 스레드에서 작업을 실행하세요.', category: 'Tech', difficulty: 2 },
    { word: 'vulnerability', phonetic: '/ˌvʌlnərəˈbɪləti/', pos: 'n.', zh: '漏洞', ko: '취약점', example: 'The security team found a critical vulnerability.', exampleZh: '安全团队发现了一个严重漏洞。', exampleKo: '보안 팀이 심각한 취약점을 발견했습니다.', category: 'Tech', difficulty: 3 },

    // ---- Business ----
    { word: 'acquisition', phonetic: '/ˌækwɪˈzɪʃən/', pos: 'n.', zh: '收购', ko: '인수', example: 'The acquisition was worth $2 billion.', exampleZh: '这次收购价值20亿美元。', exampleKo: '이번 인수는 20억 달러 규모였습니다.', category: 'Business', difficulty: 3 },
    { word: 'budget', phonetic: '/ˈbʌdʒɪt/', pos: 'n.', zh: '预算', ko: '예산', example: 'We exceeded the project budget.', exampleZh: '我们超出了项目预算。', exampleKo: '프로젝트 예산을 초과했습니다.', category: 'Business', difficulty: 1 },
    { word: 'collaborate', phonetic: '/kəˈlæbəreɪt/', pos: 'v.', zh: '合作', ko: '협업하다', example: 'Let\'s collaborate on this project.', exampleZh: '让我们在这个项目上合作。', exampleKo: '이 프로젝트에서 협업합시다.', category: 'Business', difficulty: 2 },
    { word: 'deadline', phonetic: '/ˈdedlaɪn/', pos: 'n.', zh: '截止日期', ko: '마감일', example: 'The deadline is next Monday.', exampleZh: '截止日期是下周一。', exampleKo: '마감일은 다음 주 월요일입니다.', category: 'Business', difficulty: 1 },
    { word: 'delegate', phonetic: '/ˈdelɪɡeɪt/', pos: 'v.', zh: '委派', ko: '위임하다', example: 'You should delegate some tasks to your team.', exampleZh: '你应该把一些任务委派给团队。', exampleKo: '팀에 일부 작업을 위임해야 합니다.', category: 'Business', difficulty: 2 },
    { word: 'entrepreneur', phonetic: '/ˌɑːntrəprəˈnɜːr/', pos: 'n.', zh: '企业家', ko: '기업가', example: 'She is a successful entrepreneur.', exampleZh: '她是一位成功的企业家。', exampleKo: '그녀는 성공한 기업가입니다.', category: 'Business', difficulty: 2 },
    { word: 'feasible', phonetic: '/ˈfiːzəbəl/', pos: 'adj.', zh: '可行的', ko: '실행 가능한', example: 'Is this plan feasible within our budget?', exampleZh: '这个计划在预算内可行吗？', exampleKo: '이 계획이 예산 내에서 실행 가능한가요?', category: 'Business', difficulty: 2 },
    { word: 'leverage', phonetic: '/ˈlevərɪdʒ/', pos: 'v.', zh: '利用', ko: '활용하다', example: 'We can leverage existing infrastructure.', exampleZh: '我们可以利用现有基础设施。', exampleKo: '기존 인프라를 활용할 수 있습니다.', category: 'Business', difficulty: 3 },
    { word: 'milestone', phonetic: '/ˈmaɪlstoʊn/', pos: 'n.', zh: '里程碑', ko: '이정표', example: 'Reaching 1 million users is a major milestone.', exampleZh: '达到100万用户是一个重要里程碑。', exampleKo: '100만 사용자 달성은 중요한 이정표입니다.', category: 'Business', difficulty: 2 },
    { word: 'negotiate', phonetic: '/nɪˈɡoʊʃieɪt/', pos: 'v.', zh: '谈判', ko: '협상하다', example: 'We need to negotiate better terms.', exampleZh: '我们需要谈判更好的条件。', exampleKo: '더 나은 조건을 협상해야 합니다.', category: 'Business', difficulty: 2 },
    { word: 'outsource', phonetic: '/ˈaʊtsɔːrs/', pos: 'v.', zh: '外包', ko: '아웃소싱하다', example: 'They decided to outsource the development.', exampleZh: '他们决定将开发外包。', exampleKo: '개발을 아웃소싱하기로 결정했습니다.', category: 'Business', difficulty: 2 },
    { word: 'revenue', phonetic: '/ˈrevənuː/', pos: 'n.', zh: '收入', ko: '수익', example: 'The company\'s revenue grew 30% last year.', exampleZh: '公司去年收入增长了30%。', exampleKo: '회사의 수익이 작년에 30% 성장했습니다.', category: 'Business', difficulty: 2 },
    { word: 'stakeholder', phonetic: '/ˈsteɪkhoʊldər/', pos: 'n.', zh: '利益相关者', ko: '이해관계자', example: 'All stakeholders approved the plan.', exampleZh: '所有利益相关者批准了计划。', exampleKo: '모든 이해관계자가 계획을 승인했습니다.', category: 'Business', difficulty: 3 },
    { word: 'strategy', phonetic: '/ˈstrætədʒi/', pos: 'n.', zh: '策略', ko: '전략', example: 'Our marketing strategy needs to change.', exampleZh: '我们的营销策略需要改变。', exampleKo: '마케팅 전략을 변경해야 합니다.', category: 'Business', difficulty: 1 },

    // ---- Daily Life ----
    { word: 'accommodate', phonetic: '/əˈkɑːmədeɪt/', pos: 'v.', zh: '容纳；迁就', ko: '수용하다', example: 'The hotel can accommodate 200 guests.', exampleZh: '酒店可以容纳200位客人。', exampleKo: '호텔은 200명의 손님을 수용할 수 있습니다.', category: 'Daily', difficulty: 2 },
    { word: 'appreciate', phonetic: '/əˈpriːʃieɪt/', pos: 'v.', zh: '感激', ko: '감사하다', example: 'I really appreciate your help.', exampleZh: '我真的很感激你的帮助。', exampleKo: '당신의 도움에 정말 감사합니다.', category: 'Daily', difficulty: 1 },
    { word: 'awkward', phonetic: '/ˈɔːkwərd/', pos: 'adj.', zh: '尴尬的', ko: '어색한', example: 'It was an awkward silence.', exampleZh: '那是一阵尴尬的沉默。', exampleKo: '어색한 침묵이었습니다.', category: 'Daily', difficulty: 1 },
    { word: 'commute', phonetic: '/kəˈmjuːt/', pos: 'v.', zh: '通勤', ko: '통근하다', example: 'I commute by subway every day.', exampleZh: '我每天坐地铁通勤。', exampleKo: '매일 지하철로 통근합니다.', category: 'Daily', difficulty: 1 },
    { word: 'convenient', phonetic: '/kənˈviːniənt/', pos: 'adj.', zh: '方便的', ko: '편리한', example: 'The store is very convenient to reach.', exampleZh: '这家店很方便到达。', exampleKo: '그 가게는 접근이 매우 편리합니다.', category: 'Daily', difficulty: 1 },
    { word: 'enthusiasm', phonetic: '/ɪnˈθuːziæzəm/', pos: 'n.', zh: '热情', ko: '열정', example: 'She showed great enthusiasm for the project.', exampleZh: '她对这个项目表现出极大的热情。', exampleKo: '그녀는 프로젝트에 대한 큰 열정을 보였습니다.', category: 'Emotion', difficulty: 2 },
    { word: 'frustrated', phonetic: '/ˈfrʌstreɪtɪd/', pos: 'adj.', zh: '沮丧的', ko: '좌절한', example: 'I feel frustrated when bugs are hard to find.', exampleZh: '当bug难以找到时我感到沮丧。', exampleKo: '버그를 찾기 어려울 때 좌절감을 느낍니다.', category: 'Emotion', difficulty: 1 },
    { word: 'generous', phonetic: '/ˈdʒenərəs/', pos: 'adj.', zh: '慷慨的', ko: '관대한', example: 'He is very generous with his time.', exampleZh: '他在时间上非常慷慨。', exampleKo: '그는 시간에 매우 관대합니다.', category: 'Daily', difficulty: 1 },
    { word: 'hesitate', phonetic: '/ˈhezɪteɪt/', pos: 'v.', zh: '犹豫', ko: '망설이다', example: 'Don\'t hesitate to ask questions.', exampleZh: '不要犹豫，尽管提问。', exampleKo: '질문하는 것을 망설이지 마세요.', category: 'Daily', difficulty: 1 },
    { word: 'inevitable', phonetic: '/ɪnˈevɪtəbəl/', pos: 'adj.', zh: '不可避免的', ko: '불가피한', example: 'Change is inevitable in technology.', exampleZh: '技术领域的变化是不可避免的。', exampleKo: '기술에서 변화는 불가피합니다.', category: 'Academic', difficulty: 2 },
    { word: 'overwhelm', phonetic: '/ˌoʊvərˈwelm/', pos: 'v.', zh: '压倒；使不知所措', ko: '압도하다', example: 'Don\'t let the workload overwhelm you.', exampleZh: '不要让工作量压垮你。', exampleKo: '업무량에 압도당하지 마세요.', category: 'Emotion', difficulty: 2 },
    { word: 'procrastinate', phonetic: '/proʊˈkræstɪneɪt/', pos: 'v.', zh: '拖延', ko: '미루다', example: 'Stop procrastinating and start coding.', exampleZh: '别拖延了，开始写代码。', exampleKo: '미루지 말고 코딩을 시작하세요.', category: 'Daily', difficulty: 2 },
    { word: 'spontaneous', phonetic: '/spɑːnˈteɪniəs/', pos: 'adj.', zh: '自发的', ko: '자발적인', example: 'It was a spontaneous decision to travel.', exampleZh: '旅行是一个自发的决定。', exampleKo: '여행은 자발적인 결정이었습니다.', category: 'Daily', difficulty: 3 },
    { word: 'thorough', phonetic: '/ˈθɜːroʊ/', pos: 'adj.', zh: '彻底的', ko: '철저한', example: 'We did a thorough code review.', exampleZh: '我们做了彻底的代码审查。', exampleKo: '철저한 코드 리뷰를 했습니다.', category: 'Work', difficulty: 2 },

    // ---- Work ----
    { word: 'accomplish', phonetic: '/əˈkɑːmplɪʃ/', pos: 'v.', zh: '完成', ko: '달성하다', example: 'We accomplished all our goals this quarter.', exampleZh: '这个季度我们完成了所有目标。', exampleKo: '이번 분기에 모든 목표를 달성했습니다.', category: 'Work', difficulty: 2 },
    { word: 'agenda', phonetic: '/əˈdʒendə/', pos: 'n.', zh: '议程', ko: '안건', example: 'Let\'s review today\'s meeting agenda.', exampleZh: '让我们回顾今天的会议议程。', exampleKo: '오늘 회의 안건을 검토합시다.', category: 'Work', difficulty: 1 },
    { word: 'clarify', phonetic: '/ˈklærəfaɪ/', pos: 'v.', zh: '澄清', ko: '명확히 하다', example: 'Could you clarify the requirements?', exampleZh: '你能澄清一下需求吗？', exampleKo: '요구 사항을 명확히 해주시겠습니까?', category: 'Work', difficulty: 1 },
    { word: 'consensus', phonetic: '/kənˈsensəs/', pos: 'n.', zh: '共识', ko: '합의', example: 'We need to reach a consensus.', exampleZh: '我们需要达成共识。', exampleKo: '합의에 도달해야 합니다.', category: 'Work', difficulty: 2 },
    { word: 'efficiency', phonetic: '/ɪˈfɪʃənsi/', pos: 'n.', zh: '效率', ko: '효율성', example: 'The new process improved efficiency by 40%.', exampleZh: '新流程提高了40%的效率。', exampleKo: '새로운 프로세스가 효율성을 40% 향상시켰습니다.', category: 'Work', difficulty: 2 },
    { word: 'initiative', phonetic: '/ɪˈnɪʃətɪv/', pos: 'n.', zh: '主动性', ko: '주도권', example: 'She took the initiative to fix the problem.', exampleZh: '她主动解决了这个问题。', exampleKo: '그녀가 문제를 해결하기 위해 주도적으로 나섰습니다.', category: 'Work', difficulty: 2 },
    { word: 'mandatory', phonetic: '/ˈmændətɔːri/', pos: 'adj.', zh: '强制的', ko: '필수적인', example: 'Attendance is mandatory for all employees.', exampleZh: '所有员工必须出席。', exampleKo: '모든 직원의 출석은 필수입니다.', category: 'Work', difficulty: 2 },
    { word: 'meticulous', phonetic: '/məˈtɪkjələs/', pos: 'adj.', zh: '一丝不苟的', ko: '꼼꼼한', example: 'She is meticulous about code quality.', exampleZh: '她对代码质量一丝不苟。', exampleKo: '그녀는 코드 품질에 대해 꼼꼼합니다.', category: 'Work', difficulty: 3 },
    { word: 'postpone', phonetic: '/poʊstˈpoʊn/', pos: 'v.', zh: '推迟', ko: '연기하다', example: 'We had to postpone the release.', exampleZh: '我们不得不推迟发布。', exampleKo: '릴리스를 연기해야 했습니다.', category: 'Work', difficulty: 1 },
    { word: 'productive', phonetic: '/prəˈdʌktɪv/', pos: 'adj.', zh: '高效的', ko: '생산적인', example: 'It was a very productive meeting.', exampleZh: '这是一次非常高效的会议。', exampleKo: '매우 생산적인 회의였습니다.', category: 'Work', difficulty: 1 },
    { word: 'prioritize', phonetic: '/praɪˈɔːrɪtaɪz/', pos: 'v.', zh: '优先排序', ko: '우선순위를 정하다', example: 'We need to prioritize critical bugs.', exampleZh: '我们需要优先处理关键bug。', exampleKo: '중요한 버그를 우선 처리해야 합니다.', category: 'Work', difficulty: 2 },

    // ---- Academic ----
    { word: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', pos: 'adj.', zh: '模糊的', ko: '모호한', example: 'The requirements are ambiguous.', exampleZh: '需求很模糊。', exampleKo: '요구 사항이 모호합니다.', category: 'Academic', difficulty: 2 },
    { word: 'comprehensive', phonetic: '/ˌkɑːmprɪˈhensɪv/', pos: 'adj.', zh: '全面的', ko: '포괄적인', example: 'We need a comprehensive test plan.', exampleZh: '我们需要一个全面的测试计划。', exampleKo: '포괄적인 테스트 계획이 필요합니다.', category: 'Academic', difficulty: 2 },
    { word: 'hypothesis', phonetic: '/haɪˈpɑːθəsɪs/', pos: 'n.', zh: '假设', ko: '가설', example: 'We need data to test our hypothesis.', exampleZh: '我们需要数据来验证假设。', exampleKo: '가설을 검증하기 위한 데이터가 필요합니다.', category: 'Academic', difficulty: 3 },
    { word: 'prerequisite', phonetic: '/ˌpriːˈrekwəzɪt/', pos: 'n.', zh: '先决条件', ko: '전제 조건', example: 'Swift knowledge is a prerequisite for this role.', exampleZh: 'Swift知识是这个职位的先决条件。', exampleKo: 'Swift 지식은 이 역할의 전제 조건입니다.', category: 'Academic', difficulty: 3 },
    { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', pos: 'adj.', zh: '重大的', ko: '중요한', example: 'This is a significant improvement.', exampleZh: '这是一个重大的改进。', exampleKo: '이것은 중요한 개선입니다.', category: 'Academic', difficulty: 1 },

    // ---- Travel / Food ----
    { word: 'cuisine', phonetic: '/kwɪˈziːn/', pos: 'n.', zh: '菜系', ko: '요리', example: 'Korean cuisine is famous worldwide.', exampleZh: '韩国料理世界闻名。', exampleKo: '한국 요리는 세계적으로 유명합니다.', category: 'Food', difficulty: 1 },
    { word: 'itinerary', phonetic: '/aɪˈtɪnəreri/', pos: 'n.', zh: '行程', ko: '일정', example: 'I\'ll send you the travel itinerary.', exampleZh: '我会把旅行行程发给你。', exampleKo: '여행 일정을 보내드리겠습니다.', category: 'Travel', difficulty: 2 },
    { word: 'destination', phonetic: '/ˌdestɪˈneɪʃən/', pos: 'n.', zh: '目的地', ko: '목적지', example: 'Seoul is a popular tourist destination.', exampleZh: '首尔是一个热门旅游目的地。', exampleKo: '서울은 인기 있는 관광 목적지입니다.', category: 'Travel', difficulty: 1 },
    { word: 'authentic', phonetic: '/ɔːˈθentɪk/', pos: 'adj.', zh: '正宗的', ko: '정통의', example: 'This restaurant serves authentic Chinese food.', exampleZh: '这家餐厅提供正宗中餐。', exampleKo: '이 식당은 정통 중국 음식을 제공합니다.', category: 'Food', difficulty: 2 },
    { word: 'souvenir', phonetic: '/ˌsuːvəˈnɪr/', pos: 'n.', zh: '纪念品', ko: '기념품', example: 'I bought some souvenirs for my family.', exampleZh: '我给家人买了一些纪念品。', exampleKo: '가족을 위해 기념품을 샀습니다.', category: 'Travel', difficulty: 1 },
]
