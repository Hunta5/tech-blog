import type { DailyFortune, ZodiacSign } from './types'

// ---- Deterministic hash from string ----
function hashCode(str: string): number {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

// Seeded pseudo-random (deterministic per sign + date)
function seededRandom(seed: number): () => number {
    let s = seed
    return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff
        return s / 0x7fffffff
    }
}

// ---- Template pools ----

const OVERALL_TEXTS = {
    zh: [
        ['今天运势平淡，适合休息调整。', '整体运势偏弱，低调行事为佳。', '今天适合反思，不宜做重大决定。'],
        ['运势尚可，保持平常心。', '今天中规中矩，稳步前行即可。', '平稳的一天，适合处理日常事务。'],
        ['运势不错，有小惊喜出现。', '今天状态良好，可以积极行动。', '好运正在靠近，保持乐观心态。'],
        ['运势很好，适合推进重要事项。', '今天能量满满，把握机会。', '贵人运旺，多与人交流会有收获。'],
        ['运势极佳，是收获的一天！', '今天万事如意，大胆去做！', '幸运女神眷顾，做什么都顺利。'],
    ],
    ko: [
        ['오늘은 쉬어가는 날입니다. 무리하지 마세요.', '전체 운세가 약합니다. 조용히 지내세요.', '오늘은 반성하기 좋은 날, 큰 결정은 피하세요.'],
        ['운세가 무난합니다. 평상심을 유지하세요.', '평범한 하루, 꾸준히 나아가세요.', '안정적인 하루, 일상적인 일을 처리하기 좋습니다.'],
        ['운세가 괜찮습니다. 작은 기쁨이 있을 수 있어요.', '오늘 컨디션이 좋습니다. 적극적으로 행동하세요.', '행운이 다가오고 있어요. 긍정적으로!'],
        ['운세가 좋습니다. 중요한 일을 추진하세요.', '오늘 에너지가 넘칩니다. 기회를 잡으세요.', '귀인운이 강합니다. 사람들과 교류하세요.'],
        ['운세가 최고입니다! 수확의 날!', '오늘 만사형통, 과감하게 행동하세요!', '행운의 여신이 함께합니다. 무엇이든 잘 풀려요.'],
    ],
}

const LOVE_TEXTS = {
    zh: [
        '感情方面需要更多耐心，避免争吵。', '桃花运一般，不急于表白。', '感情稳定，适合享受二人世界。',
        '异性缘不错，可能有新的邂逅。', '恋爱运极佳，单身者有望脱单！', '伴侣间默契度高，适合深入交流。',
        '今天适合用行动表达爱意。', '感情中注意倾听对方的想法。', '浪漫气息浓厚，约会好时机。',
    ],
    ko: [
        '연애 운은 인내가 필요합니다. 다툼을 피하세요.', '이성운이 보통입니다. 서두르지 마세요.', '감정이 안정적입니다. 둘만의 시간을 즐기세요.',
        '이성 인연이 좋습니다. 새로운 만남이 있을 수 있어요.', '연애운 최고! 솔로는 탈출 기회!', '커플 호흡이 좋습니다. 깊은 대화를 나누세요.',
        '오늘은 행동으로 사랑을 표현하세요.', '상대방의 마음에 귀 기울이세요.', '로맨틱한 분위기, 데이트하기 좋은 날.',
    ],
}

const CAREER_TEXTS = {
    zh: [
        '工作中可能遇到小阻碍，冷静应对。', '职场运平稳，按部就班即可。', '今天创意灵感多，适合策划方案。',
        '事业运旺盛，领导对你印象好。', '合作项目进展顺利，继续保持。', '今天适合学习新技能，提升自己。',
        '工作效率高，可以挑战难题。', '同事关系融洽，团队协作顺畅。', '有晋升或加薪的好消息。',
    ],
    ko: [
        '업무에 작은 장애가 있을 수 있어요. 침착하게 대처하세요.', '직장 운이 안정적입니다. 차근차근 진행하세요.', '오늘 창의력이 넘칩니다. 기획 업무에 적합합니다.',
        '사업운이 왕성합니다. 상사에게 좋은 인상!', '협업 프로젝트가 순조롭습니다. 계속 유지하세요.', '오늘은 새로운 기술을 배우기 좋은 날입니다.',
        '업무 효율이 높습니다. 어려운 과제에 도전하세요.', '동료 관계가 좋습니다. 팀워크가 원활합니다.', '승진이나 연봉 인상의 좋은 소식이 있을 수 있어요.',
    ],
}

const WEALTH_TEXTS = {
    zh: [
        '财运偏弱，避免大额消费。', '收支平衡，理性消费。', '有小额进账的可能。',
        '偏财运不错，可以适当投资。', '正财运强，收入稳定增长。', '意外之财的可能性很高！',
        '今天适合理财规划。', '投资方面谨慎为主。', '财运亨通，把握投资机会。',
    ],
    ko: [
        '재운이 약합니다. 큰 소비를 피하세요.', '수입과 지출이 균형적입니다. 합리적 소비를.', '소액 수입이 있을 수 있습니다.',
        '편재운이 좋습니다. 적절한 투자를 고려하세요.', '정재운이 강합니다. 수입이 꾸준히 증가합니다.', '뜻밖의 수입 가능성이 높습니다!',
        '오늘은 재테크 계획을 세우기 좋은 날.', '투자는 신중하게 접근하세요.', '재운이 형통합니다. 투자 기회를 잡으세요.',
    ],
}

const ADVICE_TEXTS = {
    zh: [
        '多喝水，注意休息，保持好心情。', '今天适合与朋友聚会，增进感情。', '尝试一些新事物，会有意外收获。',
        '保持微笑，好运会被你的正能量吸引。', '给自己一点独处时间，整理思绪。', '多关注健康，适当运动。',
        '今天的关键词是"坚持"。', '放下过去的烦恼，拥抱新的开始。', '感恩身边的人，幸福就在身边。',
        '今天适合读书或学习新知识。', '保持谦逊，虚心向他人学习。', '信任自己的直觉，它会引导你。',
    ],
    ko: [
        '물을 많이 마시고 충분히 쉬세요. 좋은 기분을 유지하세요.', '오늘은 친구들과 모임하기 좋은 날.', '새로운 것을 시도해 보세요. 뜻밖의 수확이 있을 거예요.',
        '미소를 유지하세요. 행운은 긍정 에너지에 끌립니다.', '혼자만의 시간을 갖고 생각을 정리하세요.', '건강에 신경 쓰세요. 적절한 운동을 추천합니다.',
        '오늘의 키워드는 "꾸준함"입니다.', '과거의 걱정을 내려놓고 새로운 시작을 맞이하세요.', '주변 사람들에게 감사하세요. 행복은 가까이 있습니다.',
        '오늘은 독서나 새로운 지식을 배우기 좋은 날.', '겸손함을 유지하고 다른 사람에게 배우세요.', '자신의 직감을 믿으세요. 올바른 방향으로 이끌어 줄 거예요.',
    ],
}

const LUCKY_COLORS = [
    { zh: '红色', ko: '빨간색', hex: '#ef4444' },
    { zh: '橙色', ko: '주황색', hex: '#f97316' },
    { zh: '黄色', ko: '노란색', hex: '#eab308' },
    { zh: '绿色', ko: '초록색', hex: '#22c55e' },
    { zh: '蓝色', ko: '파란색', hex: '#3b82f6' },
    { zh: '紫色', ko: '보라색', hex: '#a855f7' },
    { zh: '粉色', ko: '분홍색', hex: '#ec4899' },
    { zh: '白色', ko: '하얀색', hex: '#f8fafc' },
    { zh: '金色', ko: '금색', hex: '#d4a017' },
    { zh: '银色', ko: '은색', hex: '#94a3b8' },
]

const LUCKY_TIMES = [
    { zh: '上午 8-10 点', ko: '오전 8-10시' },
    { zh: '上午 10-12 点', ko: '오전 10-12시' },
    { zh: '下午 1-3 点', ko: '오후 1-3시' },
    { zh: '下午 3-5 点', ko: '오후 3-5시' },
    { zh: '晚上 7-9 点', ko: '저녁 7-9시' },
    { zh: '晚上 9-11 点', ko: '저녁 9-11시' },
]

// ---- Main fortune generator ----

export function getDailyFortune(sign: ZodiacSign, date: Date): DailyFortune {
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const seed = hashCode(`${sign.id}:${dateStr}`)
    const rand = seededRandom(seed)

    // Generate star ratings (1-5) with weighted distribution
    const genStars = (): number => {
        const r = rand()
        if (r < 0.08) return 1
        if (r < 0.25) return 2
        if (r < 0.55) return 3
        if (r < 0.82) return 4
        return 5
    }

    const overall = genStars()
    const love = genStars()
    const career = genStars()
    const wealth = genStars()
    const health = genStars()

    // Pick texts based on overall rating
    const textIdx = Math.floor(rand() * 3)
    const overallLevel = Math.max(0, Math.min(4, overall - 1))

    const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]

    return {
        overall,
        love,
        career,
        wealth,
        health,
        luckyNumber: Math.floor(rand() * 99) + 1,
        luckyColor: LUCKY_COLORS[Math.floor(rand() * LUCKY_COLORS.length)],
        luckyTime: LUCKY_TIMES[Math.floor(rand() * LUCKY_TIMES.length)],
        overallText: {
            zh: OVERALL_TEXTS.zh[overallLevel][textIdx],
            ko: OVERALL_TEXTS.ko[overallLevel][textIdx],
        },
        loveText: { zh: pick(LOVE_TEXTS.zh), ko: pick(LOVE_TEXTS.ko) },
        careerText: { zh: pick(CAREER_TEXTS.zh), ko: pick(CAREER_TEXTS.ko) },
        wealthText: { zh: pick(WEALTH_TEXTS.zh), ko: pick(WEALTH_TEXTS.ko) },
        advice: { zh: pick(ADVICE_TEXTS.zh), ko: pick(ADVICE_TEXTS.ko) },
    }
}
