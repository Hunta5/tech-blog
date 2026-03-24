import {
    STEMS, BRANCHES, STEM_ELEMENT, STEM_YINYANG, BRANCH_ELEMENT,
    BRANCH_HIDDEN_STEMS, ZODIAC_ANIMALS, ZODIAC_KO,
    TEN_GODS, TEN_GODS_ZH,
    type Pillar, type SajuResult, type MajorFortune, type Element, type Gender, type TenGod,
} from './types'
import { getSolarTermMonth, getHourBranchIndex } from './calendar'

// ---- Reference date: 1900-01-31 is 甲子日 (stem=0, branch=0) ----
const REF_DATE = new Date(1900, 0, 31) // Jan 31, 1900

function daysBetween(d1: Date, d2: Date): number {
    const msPerDay = 86400000
    return Math.floor((d1.getTime() - d2.getTime()) / msPerDay)
}

// ---- Year Pillar ----
// 1984 = 甲子年, so yearStemIndex = (year - 4) % 10, yearBranchIndex = (year - 4) % 12
function getYearPillar(adjustedYear: number): Pillar {
    const stemIdx = ((adjustedYear - 4) % 10 + 10) % 10
    const branchIdx = ((adjustedYear - 4) % 12 + 12) % 12
    return makePillar(stemIdx, branchIdx)
}

// ---- Month Pillar ----
// Month branch: 寅=0 maps to branch index 2, 卯=1→3, 辰=2→4 ... 丑=11→1
// Month stem: determined by year stem using the 五虎遁 rule
function getMonthPillar(adjustedYear: number, monthIndex: number): Pillar {
    const branchIdx = (monthIndex + 2) % 12

    // 五虎遁 (Five Tigers Rule): year stem determines month stem start
    const yearStemIdx = ((adjustedYear - 4) % 10 + 10) % 10
    const monthStemStart = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0] // 甲/己→丙寅, 乙/庚→戊寅, etc.
    const stemIdx = (monthStemStart[yearStemIdx] + monthIndex) % 10

    return makePillar(stemIdx, branchIdx)
}

// ---- Day Pillar ----
function getDayPillar(year: number, month: number, day: number): Pillar {
    const date = new Date(year, month - 1, day)
    const days = daysBetween(date, REF_DATE)
    const stemIdx = ((days % 10) + 10) % 10
    const branchIdx = ((days % 12) + 12) % 12
    return makePillar(stemIdx, branchIdx)
}

// ---- Hour Pillar ----
// 五鼠遁 (Five Rats Rule): day stem determines hour stem start
function getHourPillar(dayStemIdx: number, hour: number): Pillar {
    const branchIdx = getHourBranchIndex(hour)
    const hourStemStart = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8] // 甲/己→甲子, 乙/庚→丙子, etc.
    const stemIdx = (hourStemStart[dayStemIdx] + branchIdx) % 10
    return makePillar(stemIdx, branchIdx)
}

function makePillar(stemIdx: number, branchIdx: number): Pillar {
    const stem = STEMS[stemIdx]
    const branch = BRANCHES[branchIdx]
    return {
        stem,
        branch,
        stemElement: STEM_ELEMENT[stem],
        branchElement: BRANCH_ELEMENT[branch],
        stemYinyang: STEM_YINYANG[stem],
        hiddenStems: BRANCH_HIDDEN_STEMS[branch],
    }
}

// ---- Ten Gods (십신) ----
function getTenGod(dayMasterIdx: number, targetStemIdx: number): TenGod {
    const dayElement = Math.floor(dayMasterIdx / 2)  // 0=木, 1=火, 2=土, 3=金, 4=水
    const targetElement = Math.floor(targetStemIdx / 2)
    const dayYin = dayMasterIdx % 2
    const targetYin = targetStemIdx % 2
    const samePolarity = dayYin === targetYin

    // Relationship based on Five Elements cycle
    // 同我(比) / 我生(食) / 我克(财) / 克我(官) / 生我(印)
    const relation = ((targetElement - dayElement) % 5 + 5) % 5

    const godIndex = relation * 2 + (samePolarity ? 0 : 1)
    return TEN_GODS[godIndex]
}

// ---- Major Fortunes (대운/大运) ----
function getMajorFortunes(monthPillar: Pillar, gender: Gender, yearStemYinyang: number): MajorFortune[] {
    const monthStemIdx = STEMS.indexOf(monthPillar.stem as typeof STEMS[number])
    const monthBranchIdx = BRANCHES.indexOf(monthPillar.branch as typeof BRANCHES[number])

    // Direction: 阳男阴女 forward, 阴男阳女 backward
    const isForward = (yearStemYinyang === 0 && gender === 'male') ||
                      (yearStemYinyang === 1 && gender === 'female')
    const step = isForward ? 1 : -1

    const fortunes: MajorFortune[] = []
    for (let i = 1; i <= 10; i++) {
        const stemIdx = ((monthStemIdx + i * step) % 10 + 10) % 10
        const branchIdx = ((monthBranchIdx + i * step) % 12 + 12) % 12
        const stem = STEMS[stemIdx]
        fortunes.push({
            startAge: i * 10,
            stem,
            branch: BRANCHES[branchIdx],
            element: STEM_ELEMENT[stem],
        })
    }
    return fortunes
}

// ---- Five Elements count ----
function countElements(pillars: Pillar[]): Record<Element, number> {
    const counts: Record<Element, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 }

    for (const p of pillars) {
        counts[p.stemElement] += 1
        counts[p.branchElement] += 1
        for (const hs of p.hiddenStems) {
            counts[STEM_ELEMENT[hs]] += 0.5
        }
    }
    return counts
}

// ---- Main calculation ----
export function calculateSaju(
    year: number,
    month: number,
    day: number,
    hour: number,
    gender: Gender
): SajuResult {
    // Get 节气-adjusted month and year
    const { monthIndex, adjustedYear } = getSolarTermMonth(year, month, day)

    const yearPillar = getYearPillar(adjustedYear)
    const monthPillar = getMonthPillar(adjustedYear, monthIndex)
    const dayPillar = getDayPillar(year, month, day)

    const dayStemIdx = STEMS.indexOf(dayPillar.stem as typeof STEMS[number])
    const hourPillar = getHourPillar(dayStemIdx, hour)

    // Zodiac from year branch
    const yearBranchIdx = BRANCHES.indexOf(yearPillar.branch as typeof BRANCHES[number])
    const zodiac = ZODIAC_ANIMALS[yearBranchIdx]
    const zodiacKo = ZODIAC_KO[yearBranchIdx]

    // Day master
    const dayMaster = dayPillar.stem
    const dayMasterElement = STEM_ELEMENT[dayMaster]

    // Five Elements
    const elementCounts = countElements([yearPillar, monthPillar, dayPillar, hourPillar])

    // Ten Gods
    const yearStemIdx = STEMS.indexOf(yearPillar.stem as typeof STEMS[number])
    const monthStemIdx = STEMS.indexOf(monthPillar.stem as typeof STEMS[number])
    const hourStemIdx = STEMS.indexOf(hourPillar.stem as typeof STEMS[number])

    const tenGods = {
        year: getTenGod(dayStemIdx, yearStemIdx),
        month: getTenGod(dayStemIdx, monthStemIdx),
        hour: getTenGod(dayStemIdx, hourStemIdx),
    }

    // Major fortunes
    const yearStemYinyang = STEM_YINYANG[yearPillar.stem]
    const majorFortunes = getMajorFortunes(monthPillar, gender, yearStemYinyang)

    return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar,
        dayMaster,
        dayMasterElement,
        zodiac,
        zodiacKo,
        elementCounts,
        tenGods,
        majorFortunes,
    }
}
