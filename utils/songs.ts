import type { Song } from "@/types/song"

// Fallback songs data (used if API fails or during development)
const FALLBACK_SONGS: Song[] = [
  {
    id: "1",
    title: "アルビレオ (Albireo)",
    artist: "ロクデナシ (Rokudenashi)",
    color: "rgb(100, 149, 237)",
    description: "Piano cover of Albireo.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=ZhTdw7nLMxM"
  },
  {
    id: "2",
    title: "今はいいんだよ (Ima wa Iindayo)",
    artist: "MIMI",
    color: "rgb(144, 238, 144)",
    description: "Full piano cover of MIMI's song.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=nnjwtTv0vcQ"
  },
  {
    id: "3",
    title: "ちゃんとあるよ (Chanto Aru yo)",
    artist: "傘村トータ (Kasamura Tota)",
    color: "rgb(255, 160, 122)",
    description: "Reassurance that it's still there.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=xRXxETcqjdE"
  },
  {
    id: "4",
    title: "このままで (Kono Mama de)",
    artist: "西野カナ (Nishino Kana)",
    color: "rgb(255, 182, 193)",
    description: "Piano cover of Nishino Kana.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=wc1nrudQy2A"
  },
  {
    id: "5",
    title: "ハイドアンドシーク (Hide and Seek)",
    artist: "19's Sound Factory",
    color: "rgb(135, 206, 250)",
    description: "Hatsune Miku classic.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=AUBFfvKOjO4"
  },
  {
    id: "6",
    title: "ヒロイン (Heroine)",
    artist: "back number",
    color: "rgb(255, 255, 255)",
    description: "Winter ballad cover.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=KcqMGS0Uyv4"
  },
  {
    id: "7",
    title: "PLANET",
    artist: "ラムジ (Lambsey)",
    color: "rgb(59, 130, 246)",
    description: "Planetary piano vibes.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=Idnj9SqmQpg"
  },
  {
    id: "8",
    title: "明日への手紙 (Asu e no Tegami)",
    artist: "手嶌葵 (Teshima Aoi)",
    color: "rgb(167, 139, 250)",
    description: "Letter to tomorrow.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=wpPlpMrDBR4"
  },
  {
    id: "9",
    title: "悪ノ召使 (Servant of Evil)",
    artist: "mothy",
    color: "rgb(255, 215, 0)",
    description: "Story of evil, piano version.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=Hab-RjK6nQQ"
  },
  {
    id: "10",
    title: "ハロ/ハワユ (Hello/How Are You)",
    artist: "ナノウ (Nanou)",
    color: "rgb(196, 181, 253)",
    description: "Soft piano cover.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=yuXpjpAiA40"
  },
  {
    id: "11",
    title: "それで充分だよ。 (Sore de Juubun da yo)",
    artist: "MIMI",
    color: "rgb(144, 238, 144)",
    description: "That is enough.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=PtLy8grmxLM"
  },
  {
    id: "12",
    title: "愛にできることはまだあるかい",
    artist: "RADWIMPS",
    color: "rgb(100, 149, 237)",
    description: "Is there anything love can do?",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=MiunS3T3f-k"
  },
  {
    id: "13",
    title: "自傷無色 (Jishou Mushoku)",
    artist: "ねこぼーろ (Nekobolo)",
    color: "rgb(209, 213, 219)",
    description: "Self-Inflicted Achromatic.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=hRYZhEJVwRU"
  },
  {
    id: "14",
    title: "繰り返し一粒 (Kurikaeshi Hitotsubu)",
    artist: "猫虫P",
    color: "rgb(251, 146, 60)",
    description: "Repeated drop.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=al3GSJMJBVI"
  },
  {
    id: "15",
    title: "明けない夜のリリィ",
    artist: "傘村トータ",
    color: "rgb(239, 68, 68)",
    description: "Lily of the endless night.",
    tiktokUrl: "https://www.tiktok.com/@uta.uta_p",
    youtubeUrl: "https://www.youtube.com/watch?v=bUlCj9pcGis"
  }
]

// Function to fetch latest songs from YouTube API
export async function getSongs(): Promise<Song[]> {
  try {
    const res = await fetch('/api/youtube', {
      cache: 'no-store', // Always fetch fresh data
      next: { revalidate: 0 }
    })

    if (!res.ok) {
      console.warn('Failed to fetch from YouTube API, using fallback data')
      return FALLBACK_SONGS
    }

    const songs = await res.json()

    if (!Array.isArray(songs) || songs.length === 0) {
      console.warn('Invalid YouTube API response, using fallback data')
      return FALLBACK_SONGS
    }

    return songs
  } catch (error) {
    console.error('Error fetching songs from YouTube:', error)
    return FALLBACK_SONGS
  }
}

// Export static SONGS for backward compatibility and SSR
export const SONGS = FALLBACK_SONGS
