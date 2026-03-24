'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Script from 'next/script'

// ============================================
// 🔑 Kakao API Key — 在这里填入你的 JavaScript Key
// 从 https://developers.kakao.com 获取
// ============================================
const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || 'YOUR_KAKAO_JS_KEY_HERE'

// ---- types ----

interface Place {
    id: string
    place_name: string
    category_name: string
    category_group_code: string
    phone: string
    address_name: string
    road_address_name: string
    x: string  // longitude
    y: string  // latitude
    distance: string  // meters
    place_url: string
}

interface Position {
    lat: number
    lng: number
}

type RadiusOption = 1000 | 3000 | 5000
type SortBy = 'distance' | 'accuracy'

interface CategoryOption {
    code: string
    label: { zh: string; ko: string }
    icon: string
}

const CATEGORIES: CategoryOption[] = [
    { code: 'FD6', label: { zh: '全部餐厅', ko: '전체 음식점' }, icon: '🍽️' },
    { code: 'CE7', label: { zh: '咖啡厅', ko: '카페' }, icon: '☕' },
]

// keyword-based sub-categories for FD6
const FOOD_KEYWORDS: { keyword: string; label: { zh: string; ko: string }; icon: string }[] = [
    { keyword: '한식', label: { zh: '韩餐', ko: '한식' }, icon: '🍚' },
    { keyword: '중식', label: { zh: '中餐', ko: '중식' }, icon: '🥟' },
    { keyword: '일식', label: { zh: '日料', ko: '일식' }, icon: '🍣' },
    { keyword: '양식', label: { zh: '西餐', ko: '양식' }, icon: '🍝' },
    { keyword: '치킨', label: { zh: '炸鸡', ko: '치킨' }, icon: '🍗' },
    { keyword: '피자', label: { zh: '披萨', ko: '피자' }, icon: '🍕' },
    { keyword: '분식', label: { zh: '小吃', ko: '분식' }, icon: '🍜' },
    { keyword: '고기', label: { zh: '烤肉', ko: '고기/구이' }, icon: '🥩' },
]

const RADIUS_OPTIONS: { value: RadiusOption; label: string }[] = [
    { value: 1000, label: '1km' },
    { value: 3000, label: '3km' },
    { value: 5000, label: '5km' },
]

// ---- declare kakao types ----
declare global {
    interface Window {
        kakao: any
    }
}

export default function FoodPage() {
    const { lang } = useLanguage()
    const isKo = lang === 'ko'

    const [sdkLoaded, setSdkLoaded] = useState(false)
    const [position, setPosition] = useState<Position | null>(null)
    const [places, setPlaces] = useState<Place[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [radius, setRadius] = useState<RadiusOption>(3000)
    const [category, setCategory] = useState('FD6')
    const [keyword, setKeyword] = useState('')
    const [sortBy, setSortBy] = useState<SortBy>('distance')
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
    const [geoLoading, setGeoLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)

    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const overlayRef = useRef<any>(null)

    const isKeyValid = KAKAO_JS_KEY !== 'YOUR_KAKAO_JS_KEY_HERE' && KAKAO_JS_KEY.length > 10

    // ---- Get current location ----
    const getCurrentPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError(isKo ? '이 브라우저는 위치 서비스를 지원하지 않습니다.' : '浏览器不支持定位功能。')
            return
        }
        setGeoLoading(true)
        setError('')
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                setGeoLoading(false)
            },
            (err) => {
                const msg = err.code === 1
                    ? (isKo ? '위치 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.' : '位置权限被拒绝。请在浏览器设置中允许。')
                    : (isKo ? '위치를 가져올 수 없습니다.' : '无法获取位置。')
                setError(msg)
                setGeoLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }, [isKo])

    // ---- Initialize map when SDK loaded + position available ----
    useEffect(() => {
        if (!sdkLoaded || !position || !mapRef.current || !window.kakao?.maps) return

        window.kakao.maps.load(() => {
            const center = new window.kakao.maps.LatLng(position.lat, position.lng)
            const map = new window.kakao.maps.Map(mapRef.current, {
                center,
                level: radius <= 1000 ? 5 : radius <= 3000 ? 7 : 8,
            })

            // current position marker
            const markerImg = new window.kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                new window.kakao.maps.Size(24, 35)
            )
            new window.kakao.maps.Marker({
                map,
                position: center,
                image: markerImg,
                title: isKo ? '현재 위치' : '当前位置',
            })

            // radius circle
            new window.kakao.maps.Circle({
                map,
                center,
                radius,
                strokeWeight: 1,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.3,
                fillColor: '#3b82f6',
                fillOpacity: 0.06,
            })

            mapInstanceRef.current = map
        })
    }, [sdkLoaded, position, radius, isKo])

    // ---- Search places ----
    const searchPlaces = useCallback((pageNum: number = 1) => {
        if (!position || !window.kakao?.maps?.services) return
        setLoading(true)
        setError('')
        if (pageNum === 1) {
            setPlaces([])
            clearMarkers()
        }

        const ps = new window.kakao.maps.services.Places()
        const options: any = {
            location: new window.kakao.maps.LatLng(position.lat, position.lng),
            radius,
            sort: sortBy === 'distance'
                ? window.kakao.maps.services.SortBy.DISTANCE
                : window.kakao.maps.services.SortBy.ACCURACY,
            page: pageNum,
            size: 15,
        }

        const callback = (data: Place[], status: any, pagination: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setPlaces(prev => pageNum === 1 ? data : [...prev, ...data])
                setHasMore(pagination.hasNextPage)
                setPage(pageNum)
                addMarkers(data)
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                if (pageNum === 1) setPlaces([])
                setHasMore(false)
            } else {
                setError(isKo ? '검색 중 오류가 발생했습니다.' : '搜索出错。')
            }
            setLoading(false)
        }

        if (keyword) {
            ps.keywordSearch(keyword, callback, { ...options, category_group_code: 'FD6' })
        } else {
            ps.categorySearch(category, callback, options)
        }
    }, [position, radius, category, keyword, sortBy, isKo])

    // trigger search when params change
    useEffect(() => {
        if (position && sdkLoaded && window.kakao?.maps?.services) {
            searchPlaces(1)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position, radius, category, keyword, sortBy, sdkLoaded])

    // ---- Map markers ----
    const clearMarkers = () => {
        markersRef.current.forEach(m => m.setMap(null))
        markersRef.current = []
        if (overlayRef.current) overlayRef.current.setMap(null)
    }

    const addMarkers = (data: Place[]) => {
        if (!mapInstanceRef.current) return
        const map = mapInstanceRef.current

        data.forEach(place => {
            const pos = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x))
            const marker = new window.kakao.maps.Marker({ map, position: pos })

            window.kakao.maps.event.addListener(marker, 'click', () => {
                setSelectedPlace(place)
                if (overlayRef.current) overlayRef.current.setMap(null)
                const overlay = new window.kakao.maps.CustomOverlay({
                    content: `<div style="padding:8px 12px;background:#1f2937;color:white;border-radius:8px;border:1px solid #374151;font-size:12px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.3);">${place.place_name}</div>`,
                    position: pos,
                    yAnchor: 1.5,
                })
                overlay.setMap(map)
                overlayRef.current = overlay
            })

            markersRef.current.push(marker)
        })
    }

    const panToPlace = (place: Place) => {
        setSelectedPlace(place)
        if (!mapInstanceRef.current) return
        const pos = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x))
        mapInstanceRef.current.panTo(pos)
    }

    const formatDistance = (meters: string) => {
        const m = parseInt(meters)
        if (m < 1000) return `${m}m`
        return `${(m / 1000).toFixed(1)}km`
    }

    const getCategoryIcon = (name: string) => {
        if (name.includes('한식')) return '🍚'
        if (name.includes('중식') || name.includes('중국')) return '🥟'
        if (name.includes('일식') || name.includes('초밥')) return '🍣'
        if (name.includes('양식') || name.includes('레스토랑')) return '🍝'
        if (name.includes('치킨')) return '🍗'
        if (name.includes('피자')) return '🍕'
        if (name.includes('분식') || name.includes('떡볶이')) return '🍜'
        if (name.includes('고기') || name.includes('구이') || name.includes('삼겹')) return '🥩'
        if (name.includes('카페') || name.includes('커피')) return '☕'
        if (name.includes('베이커리') || name.includes('빵')) return '🍞'
        return '🍽️'
    }

    return (
        <>
            {/* Kakao SDK */}
            {isKeyValid && (
                <Script
                    src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`}
                    onLoad={() => setSdkLoaded(true)}
                />
            )}

            <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
                {/* Header */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                    {isKo ? '주변 맛집 찾기' : '周边美食搜索'}
                </h1>
                <p className="text-gray-400 mb-8">
                    {isKo ? '현재 위치 기반으로 주변 맛집을 찾아보세요.' : '基于当前位置搜索周边美食。'}
                </p>

                {/* API Key warning */}
                {!isKeyValid && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
                        <h3 className="text-amber-400 font-bold mb-2">⚠️ Kakao API Key {isKo ? '필요' : '需要设置'}</h3>
                        <p className="text-sm text-gray-400 mb-3">
                            {isKo
                                ? '이 기능을 사용하려면 Kakao JavaScript Key가 필요합니다.'
                                : '使用此功能需要 Kakao JavaScript Key。'}
                        </p>
                        <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-xs text-gray-300 space-y-1">
                            <p className="text-gray-500"># .env.local</p>
                            <p>NEXT_PUBLIC_KAKAO_JS_KEY=your_kakao_javascript_key</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            → <a href="https://developers.kakao.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 transition">developers.kakao.com</a> {isKo ? '에서 앱을 만들고 JavaScript Key를 발급받으세요.' : ' 注册应用获取 JavaScript Key。'}
                        </p>
                    </div>
                )}

                {/* Get location button */}
                {!position && isKeyValid && (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">📍</div>
                        <p className="text-gray-400 mb-6">
                            {isKo ? '위치 권한을 허용하면 주변 맛집을 검색합니다.' : '允许位置权限后即可搜索周边美食。'}
                        </p>
                        <button onClick={getCurrentPosition} disabled={geoLoading}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium text-sm hover:opacity-90 transition shadow-lg shadow-red-500/20 disabled:opacity-50">
                            {geoLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {isKo ? '위치 확인 중...' : '获取位置中...'}
                                </span>
                            ) : (isKo ? '현재 위치 확인' : '获取当前位置')}
                        </button>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-6">{error}</div>
                )}

                {/* Main content */}
                {position && isKeyValid && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-4">
                            {/* Radius */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{isKo ? '반경' : '范围'}</span>
                                {RADIUS_OPTIONS.map(r => (
                                    <button key={r.value} onClick={() => setRadius(r.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            radius === r.value
                                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                        }`}>
                                        {r.label}
                                    </button>
                                ))}

                                <span className="text-xs text-gray-600 mx-1">|</span>
                                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{isKo ? '정렬' : '排序'}</span>
                                <button onClick={() => setSortBy('distance')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        sortBy === 'distance' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                    }`}>
                                    {isKo ? '거리순' : '距离'}
                                </button>
                                <button onClick={() => setSortBy('accuracy')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        sortBy === 'accuracy' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                    }`}>
                                    {isKo ? '정확도순' : '相关度'}
                                </button>

                                {/* Relocate */}
                                <button onClick={getCurrentPosition}
                                    className="ml-auto p-2 rounded-lg bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white transition"
                                    title={isKo ? '위치 새로고침' : '刷新位置'}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Category tabs */}
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button key={cat.code}
                                        onClick={() => { setCategory(cat.code); setKeyword('') }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            category === cat.code && !keyword
                                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                        }`}>
                                        <span>{cat.icon}</span>
                                        <span>{isKo ? cat.label.ko : cat.label.zh}</span>
                                    </button>
                                ))}
                                <span className="text-gray-700">|</span>
                                {FOOD_KEYWORDS.map(fk => (
                                    <button key={fk.keyword}
                                        onClick={() => { setKeyword(fk.keyword); setCategory('FD6') }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            keyword === fk.keyword
                                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white'
                                        }`}>
                                        <span>{fk.icon}</span>
                                        <span>{isKo ? fk.label.ko : fk.label.zh}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Map + List */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
                            {/* Map */}
                            <div className="rounded-xl overflow-hidden border border-gray-700/50 bg-gray-800/30" style={{ height: '500px' }}>
                                <div ref={mapRef} className="w-full h-full" />
                            </div>

                            {/* List */}
                            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col" style={{ height: '500px' }}>
                                {/* List header */}
                                <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between shrink-0">
                                    <span className="text-sm font-medium text-gray-300">
                                        {loading ? (isKo ? '검색 중...' : '搜索中...') : `${places.length} ${isKo ? '개 결과' : '个结果'}`}
                                    </span>
                                </div>

                                {/* List items */}
                                <div className="flex-1 overflow-y-auto">
                                    {places.length === 0 && !loading && (
                                        <div className="text-center py-12 text-gray-500 text-sm">
                                            {isKo ? '검색 결과가 없습니다.' : '没有搜索结果。'}
                                        </div>
                                    )}

                                    {places.map(place => {
                                        const isActive = selectedPlace?.id === place.id
                                        return (
                                            <button key={place.id}
                                                onClick={() => panToPlace(place)}
                                                className={`w-full text-left px-4 py-3 border-b border-gray-800/50 transition hover:bg-gray-800/30 ${
                                                    isActive ? 'bg-orange-500/5 border-l-2 border-l-orange-500' : ''
                                                }`}>
                                                <div className="flex items-start gap-3">
                                                    <span className="text-lg mt-0.5">{getCategoryIcon(place.category_name)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-200 truncate">{place.place_name}</div>
                                                        <div className="text-xs text-gray-500 truncate mt-0.5">
                                                            {place.category_name.split('>').pop()?.trim()}
                                                        </div>
                                                        <div className="text-xs text-gray-600 truncate mt-0.5">
                                                            {place.road_address_name || place.address_name}
                                                        </div>
                                                        {place.phone && (
                                                            <div className="text-xs text-gray-600 mt-0.5">📞 {place.phone}</div>
                                                        )}
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="text-xs font-mono text-orange-400">{formatDistance(place.distance)}</div>
                                                        <a href={place.place_url} target="_blank" rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[10px] text-blue-400 hover:text-blue-300 transition mt-1 inline-block">
                                                            {isKo ? '상세' : '详情'} →
                                                        </a>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}

                                    {/* Load more */}
                                    {hasMore && (
                                        <div className="p-4 text-center">
                                            <button onClick={() => searchPlaces(page + 1)} disabled={loading}
                                                className="px-4 py-2 bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-xs transition disabled:opacity-50">
                                                {loading ? (isKo ? '로딩 중...' : '加载中...') : (isKo ? '더 보기' : '加载更多')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Selected place detail card */}
                        {selectedPlace && (
                            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl">{getCategoryIcon(selectedPlace.category_name)}</span>
                                            <h3 className="text-lg font-bold text-white">{selectedPlace.place_name}</h3>
                                            <span className="text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded">
                                                {formatDistance(selectedPlace.distance)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{selectedPlace.category_name.split('>').map(s => s.trim()).join(' · ')}</p>
                                        <p className="text-sm text-gray-400 mt-1">📍 {selectedPlace.road_address_name || selectedPlace.address_name}</p>
                                        {selectedPlace.phone && <p className="text-sm text-gray-400 mt-0.5">📞 {selectedPlace.phone}</p>}
                                    </div>
                                    <a href={selectedPlace.place_url} target="_blank" rel="noopener noreferrer"
                                        className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-medium hover:bg-orange-500/30 transition shrink-0">
                                        {isKo ? '카카오맵에서 보기' : '在 Kakao Map 查看'} →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
