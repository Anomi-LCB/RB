export interface WeatherData {
    temp: number;
    description: string;
    icon: string;
}

export async function getMokpoWeather(): Promise<WeatherData | null> {
    // 목포 좌표: 위도 34.8118, 경도 126.3922
    const lat = 34.8118;
    const lon = 126.3922;
    // 공개용 무료 키 (개발 테스트용) - 추후 사용자 키로 교체가 필요할 수 있음
    const API_KEY = '8d927ead79768f5c3a38cb51a9415668';

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`,
            { next: { revalidate: 3600 } } // 1시간마다 캐시 갱신
        );

        if (!res.ok) return null;

        const data = await res.json();
        return {
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
        };
    } catch (error) {
        console.error("Weather fetch error:", error);
        return null;
    }
}
