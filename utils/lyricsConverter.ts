
import { LyricLine, LyricWord } from '../types';

interface RawLyricJson {
    trackId: string;
    lyrics: {
        lineStart: number;
        text: string;
        words: {
            word: string;
            start: number;
            end: number;
        }[];
    }[];
}

export const convertEnhancedLyrics = (json: RawLyricJson): LyricLine[] => {
    if (!json || !json.lyrics) return [];

    return json.lyrics.map(line => ({
        time: line.lineStart,
        text: line.text,
        words: line.words.map(w => ({
            word: w.word,
            start: w.start,
            end: w.end
        }))
    }));
};
