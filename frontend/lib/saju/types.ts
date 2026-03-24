// ---- 天干 (Heavenly Stems) ----
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
export const STEMS_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const
export type Stem = typeof STEMS[number]

// ---- 地支 (Earthly Branches) ----
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
export const BRANCHES_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const
export type Branch = typeof BRANCHES[number]

// ---- 五行 (Five Elements) ----
export const ELEMENTS = ['木', '火', '土', '金', '水'] as const
export const ELEMENTS_KO = ['목', '화', '토', '금', '수'] as const
export const ELEMENTS_EN = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const
export type Element = typeof ELEMENTS[number]

// ---- 十神 (Ten Gods) ----
export const TEN_GODS = ['비견', '겁재', '식신', '상관', '편재', '정재', '편관', '정관', '편인', '정인'] as const
export const TEN_GODS_ZH = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '偏官', '正官', '偏印', '正印'] as const
export type TenGod = typeof TEN_GODS[number]

// ---- 생肖 (Zodiac Animals) ----
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const
export const ZODIAC_KO = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'] as const

// ---- Mappings ----

// 天干 → 五行
export const STEM_ELEMENT: Record<string, Element> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
}

// 天干 → 阴阳 (0=阳, 1=阴)
export const STEM_YINYANG: Record<string, number> = {
    '甲': 0, '乙': 1, '丙': 0, '丁': 1, '戊': 0,
    '己': 1, '庚': 0, '辛': 1, '壬': 0, '癸': 1,
}

// 地支 → 五行
export const BRANCH_ELEMENT: Record<string, Element> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

// 地支 → 阴阳
export const BRANCH_YINYANG: Record<string, number> = {
    '子': 0, '丑': 1, '寅': 0, '卯': 1, '辰': 0, '巳': 1,
    '午': 0, '未': 1, '申': 0, '酉': 1, '戌': 0, '亥': 1,
}

// 地支藏干 (Hidden Stems in Branches)
export const BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
    '子': ['癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲'],
}

// 五行 colors
export const ELEMENT_COLORS: Record<Element, { bg: string; text: string; border: string }> = {
    '木': { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
    '火': { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
    '土': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    '金': { bg: 'bg-gray-400/15', text: 'text-gray-300', border: 'border-gray-400/30' },
    '水': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
}

// ---- Result types ----

export interface Pillar {
    stem: string         // 天干 (甲~癸)
    branch: string       // 地支 (子~亥)
    stemElement: Element
    branchElement: Element
    stemYinyang: number  // 0=阳, 1=阴
    hiddenStems: string[]
}

export interface SajuResult {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar
    dayMaster: string      // 日主 (日干)
    dayMasterElement: Element
    zodiac: string         // 생肖
    zodiacKo: string
    elementCounts: Record<Element, number>
    tenGods: {
        year: TenGod
        month: TenGod
        hour: TenGod
    }
    majorFortunes: MajorFortune[]
}

export interface MajorFortune {
    startAge: number
    stem: string
    branch: string
    element: Element
}

export type Gender = 'male' | 'female'
