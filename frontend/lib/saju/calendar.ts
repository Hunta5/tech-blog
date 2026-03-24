// ---- Solar Terms (节气) for month pillar calculation ----
// Each month boundary is defined by the solar term (节), not the lunar calendar
// 立春(2/4), 惊蛰(3/6), 清明(4/5), 立夏(5/6), 芒种(6/6), 小暑(7/7),
// 立秋(8/8), 白露(9/8), 寒露(10/8), 立冬(11/7), 大雪(12/7), 小寒(1/6)

// Solar term approximate dates (day of month) for each month boundary
// [month, day] — the start of each 节气 month
export const SOLAR_TERMS: [number, number][] = [
    [2, 4],   // 立春 → 寅月 (month index 0)
    [3, 6],   // 惊蛰 → 卯月
    [4, 5],   // 清明 → 辰月
    [5, 6],   // 立夏 → 巳月
    [6, 6],   // 芒种 → 午月
    [7, 7],   // 小暑 → 未月
    [8, 8],   // 立秋 → 申月
    [9, 8],   // 白露 → 酉月
    [10, 8],  // 寒露 → 戌月
    [11, 7],  // 立冬 → 亥月
    [12, 7],  // 大雪 → 子月
    [1, 6],   // 小寒 → 丑月
]

/**
 * Get the 节气-based month index (0=寅 ~ 11=丑)
 * The year pillar also switches at 立春 (Feb 4), not Jan 1
 */
export function getSolarTermMonth(solarYear: number, solarMonth: number, solarDay: number): { monthIndex: number; adjustedYear: number } {
    // Find which 节气 month we're in
    // monthIndex 0 = 寅 (starts ~Feb 4)
    // monthIndex 11 = 丑 (starts ~Jan 6)

    let monthIndex: number
    let adjustedYear = solarYear

    if (solarMonth === 1 && solarDay < SOLAR_TERMS[11][1]) {
        // Before 小寒 in January → still in previous year's 子月 (index 10)
        monthIndex = 10
        adjustedYear = solarYear - 1
    } else if (solarMonth === 1) {
        // After 小寒 in January → 丑月 (index 11)
        monthIndex = 11
        adjustedYear = solarYear - 1
    } else if (solarMonth === 2 && solarDay < SOLAR_TERMS[0][1]) {
        // Before 立春 in February → still 丑月 (index 11) of previous year
        monthIndex = 11
        adjustedYear = solarYear - 1
    } else {
        // Find the matching solar term
        // SOLAR_TERMS[0] = Feb 4 (寅月), [1] = Mar 6 (卯月), ...
        monthIndex = 0
        for (let i = 0; i < 10; i++) {
            const [termMonth, termDay] = SOLAR_TERMS[i + 1]
            if (solarMonth < termMonth || (solarMonth === termMonth && solarDay < termDay)) {
                monthIndex = i
                break
            }
            monthIndex = i + 1
        }
        // Handle Dec → Jan transition
        if (solarMonth === 12 && solarDay >= SOLAR_TERMS[10][1]) {
            monthIndex = 10 // 子月
        }
        if (solarMonth >= 12 && monthIndex >= 10) {
            // 子月 (Dec) and 丑月 (Jan) belong to the current year in 사주
        }
    }

    return { monthIndex, adjustedYear }
}

/**
 * Convert hour (0-23) to 地支 时辰 index
 * 子时: 23-1, 丑时: 1-3, 寅时: 3-5, ...
 */
export function getHourBranchIndex(hour: number): number {
    // Each 시辰 covers 2 hours, starting from 子时 (23:00)
    return Math.floor(((hour + 1) % 24) / 2)
}
