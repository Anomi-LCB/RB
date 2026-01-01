import { startOfYear, differenceInDays } from 'date-fns';

export interface YoutubeVideo {
    videoId: string;
    title: string;
    dayNumber: number;
    thumbnailUrl: string;
    publishedAt: string;
    duration?: string; // ISO 8601 format (e.g., PT15M30S)
}

const PLAYLIST_ID = 'PLVcVykBcFZTR4Q6cvmybjPgCklZlv-Ghj';
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const CACHE_KEY = 'youtube_bible_reading_cache';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * 오늘이 1월 1일로부터 몇 번째 날인지 계산 (1~366)
 */
export function getDayOfYear(date: Date = new Date()): number {
    const start = startOfYear(date);
    return differenceInDays(date, start) + 1;
}

/**
 * ISO 8601 기간 (PT15M30S)을 분 단위로 변환 (반올림)
 */
export function parseDurationToMinutes(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    const totalMinutes = (hours * 60) + minutes + (seconds >= 30 ? 1 : 0);
    return totalMinutes || 1; // 최소 1분
}

/**
 * YouTube API를 통해 재생목록의 모든 영상을 가져옴 (최대 365개 이상)
 * 영상 길이(duration) 정보를 포함하기 위해 추가 API 호출 수행
 */
export async function fetchYoutubePlaylist(): Promise<YoutubeVideo[]> {
    if (!API_KEY) {
        console.warn('YouTube API Key is missing. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in .env.local');
        return [];
    }

    // 1. 캐시 확인
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        const { videos, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
            return videos;
        }
    }

    // 2. API 호출
    const allVideos: YoutubeVideo[] = [];
    let nextPageToken = '';

    try {
        do {
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
            const response = await fetch(playlistUrl);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

            // 영상 상세 정보(길이 포함) 가져오기
            const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`;
            const detailsResponse = await fetch(videoDetailsUrl);
            const detailsData = await detailsResponse.json();
            const durationMap = new Map(detailsData.items.map((v: any) => [v.id, v.contentDetails.duration]));

            const items = data.items.map((item: any, index: number) => {
                const title = item.snippet.title;
                const match = title.match(/(\d+)회차/);
                const dayNumber = match ? parseInt(match[1]) : (allVideos.length + index + 1);
                const videoId = item.snippet.resourceId.videoId;

                return {
                    videoId: videoId,
                    title: title,
                    dayNumber: dayNumber,
                    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                    publishedAt: item.snippet.publishedAt,
                    duration: durationMap.get(videoId) as string,
                };
            });

            allVideos.push(...items);
            nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        // 3. 캐시 저장
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            videos: allVideos,
            timestamp: Date.now()
        }));

        return allVideos;
    } catch (error) {
        console.error('Failed to fetch YouTube playlist:', error);
        return [];
    }
}

/**
 * 특정 일차에 해당하는 영상을 반환 (재생목록 예외 처리 포함)
 * - 1~245회: 순차적 매칭
 * - 246회: 영상 없음
 * - 247~354회: 1회 밀린 순번 (246번째 영상부터)
 * - 355회: 재생목록 가장 마지막(364번째) 영상
 * - 356~365회: 2회 밀린 순번
 */
export function getVideoForDay(videos: YoutubeVideo[], dayNumber: number): YoutubeVideo | null {
    if (videos.length === 0) return null;

    const day = dayNumber > 365 ? 365 : dayNumber;

    if (day <= 245) {
        // 1-245회: 정상 순번 (index 0~244)
        return videos[day - 1] || null;
    } else if (day === 246) {
        // 246회: 영상 없음
        return null;
    } else if (day >= 247 && day <= 354) {
        // 247~354회: 1회 밀림 (index = day - 2)
        // 예: 247일차 -> 246번째 영상 (index 245)
        return videos[day - 2] || null;
    } else if (day === 355) {
        // 355회: 재생목록 가장 마지막 (364번째, index 363)
        return videos[363] || videos[videos.length - 1] || null;
    } else {
        // 356~365회: 2회 밀림 (index = day - 3)
        // 예: 356일차 -> 354번째 영상 (index 353)
        return videos[day - 3] || null;
    }
}
