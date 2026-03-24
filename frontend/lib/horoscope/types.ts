export interface ZodiacSign {
    id: string
    symbol: string
    name: { zh: string; ko: string; en: string }
    dateRange: { zh: string; ko: string }
    element: { zh: string; ko: string; en: string }
    ruling: { zh: string; ko: string }
    startMonth: number
    startDay: number
    endMonth: number
    endDay: number
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
    { id: 'aries', symbol: '♈', name: { zh: '白羊座', ko: '양자리', en: 'Aries' }, dateRange: { zh: '3/21 - 4/19', ko: '3/21 - 4/19' }, element: { zh: '火', ko: '불', en: 'Fire' }, ruling: { zh: '火星', ko: '화성' }, startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { id: 'taurus', symbol: '♉', name: { zh: '金牛座', ko: '황소자리', en: 'Taurus' }, dateRange: { zh: '4/20 - 5/20', ko: '4/20 - 5/20' }, element: { zh: '土', ko: '흙', en: 'Earth' }, ruling: { zh: '金星', ko: '금성' }, startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { id: 'gemini', symbol: '♊', name: { zh: '双子座', ko: '쌍둥이자리', en: 'Gemini' }, dateRange: { zh: '5/21 - 6/21', ko: '5/21 - 6/21' }, element: { zh: '风', ko: '바람', en: 'Air' }, ruling: { zh: '水星', ko: '수성' }, startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
    { id: 'cancer', symbol: '♋', name: { zh: '巨蟹座', ko: '게자리', en: 'Cancer' }, dateRange: { zh: '6/22 - 7/22', ko: '6/22 - 7/22' }, element: { zh: '水', ko: '물', en: 'Water' }, ruling: { zh: '月亮', ko: '달' }, startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
    { id: 'leo', symbol: '♌', name: { zh: '狮子座', ko: '사자자리', en: 'Leo' }, dateRange: { zh: '7/23 - 8/22', ko: '7/23 - 8/22' }, element: { zh: '火', ko: '불', en: 'Fire' }, ruling: { zh: '太阳', ko: '태양' }, startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { id: 'virgo', symbol: '♍', name: { zh: '处女座', ko: '처녀자리', en: 'Virgo' }, dateRange: { zh: '8/23 - 9/22', ko: '8/23 - 9/22' }, element: { zh: '土', ko: '흙', en: 'Earth' }, ruling: { zh: '水星', ko: '수성' }, startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { id: 'libra', symbol: '♎', name: { zh: '天秤座', ko: '천칭자리', en: 'Libra' }, dateRange: { zh: '9/23 - 10/23', ko: '9/23 - 10/23' }, element: { zh: '风', ko: '바람', en: 'Air' }, ruling: { zh: '金星', ko: '금성' }, startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
    { id: 'scorpio', symbol: '♏', name: { zh: '天蝎座', ko: '전갈자리', en: 'Scorpio' }, dateRange: { zh: '10/24 - 11/22', ko: '10/24 - 11/22' }, element: { zh: '水', ko: '물', en: 'Water' }, ruling: { zh: '冥王星', ko: '명왕성' }, startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
    { id: 'sagittarius', symbol: '♐', name: { zh: '射手座', ko: '궁수자리', en: 'Sagittarius' }, dateRange: { zh: '11/23 - 12/21', ko: '11/23 - 12/21' }, element: { zh: '火', ko: '불', en: 'Fire' }, ruling: { zh: '木星', ko: '목성' }, startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
    { id: 'capricorn', symbol: '♑', name: { zh: '摩羯座', ko: '염소자리', en: 'Capricorn' }, dateRange: { zh: '12/22 - 1/19', ko: '12/22 - 1/19' }, element: { zh: '土', ko: '흙', en: 'Earth' }, ruling: { zh: '土星', ko: '토성' }, startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { id: 'aquarius', symbol: '♒', name: { zh: '水瓶座', ko: '물병자리', en: 'Aquarius' }, dateRange: { zh: '1/20 - 2/18', ko: '1/20 - 2/18' }, element: { zh: '风', ko: '바람', en: 'Air' }, ruling: { zh: '天王星', ko: '천왕성' }, startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { id: 'pisces', symbol: '♓', name: { zh: '双鱼座', ko: '물고기자리', en: 'Pisces' }, dateRange: { zh: '2/19 - 3/20', ko: '2/19 - 3/20' }, element: { zh: '水', ko: '물', en: 'Water' }, ruling: { zh: '海王星', ko: '해왕성' }, startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
]

export interface DailyFortune {
    overall: number       // 1-5 stars
    love: number
    career: number
    wealth: number
    health: number
    luckyNumber: number
    luckyColor: { zh: string; ko: string; hex: string }
    luckyTime: { zh: string; ko: string }
    overallText: { zh: string; ko: string }
    loveText: { zh: string; ko: string }
    careerText: { zh: string; ko: string }
    wealthText: { zh: string; ko: string }
    advice: { zh: string; ko: string }
}

export function getZodiacSign(month: number, day: number): ZodiacSign {
    for (const sign of ZODIAC_SIGNS) {
        if (sign.startMonth === sign.endMonth) {
            if (month === sign.startMonth && day >= sign.startDay && day <= sign.endDay) return sign
        } else if (sign.startMonth > sign.endMonth) {
            // Capricorn: Dec 22 - Jan 19
            if ((month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay)) return sign
        } else {
            if ((month === sign.startMonth && day >= sign.startDay) || (month === sign.endMonth && day <= sign.endDay)) return sign
        }
    }
    return ZODIAC_SIGNS[0]
}
