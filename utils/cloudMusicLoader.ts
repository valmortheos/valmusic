
export interface CloudSongConfig {
    audioUrl: string;
    metadataUrl: string;
    coverUrl: string;
}

// Format Baru: Audio | Metadata JSON | Cover JPG
const CLOUD_CONFIGS: CloudSongConfig[] = [
    {
        audioUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/songs/Gracie%20Abrams%20-%20I%20Love%20You%2C%20I%27m%20Sorry.mp3",
        metadataUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/Gracie%20Abrams%20-%20I%20Love%20You%2C%20I%27m%20Sorry.mp3_metadata.json",
        coverUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/Gracie%20Abrams%20-%20I%20Love%20You%2C%20I%27m%20Sorry_cover.jpg"
    },
    {
        audioUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/songs/Gracie%20Abrams%20-%20That%E2%80%99s%20So%20True.mp3",
        metadataUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/Gracie%20Abrams%20-%20That%E2%80%99s%20So%20True.mp3_metadata.json",
        coverUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/Gracie%20Abrams%20-%20That%E2%80%99s%20So%20True_cover.jpg"
    },
    {
        audioUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/songs/NIKI%20-%20Backburner.mp3",
        metadataUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/NIKI%20-%20Backburner.mp3_metadata.json",
        coverUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/NIKI%20-%20Backburner_cover.jpg"
    },
    {
        audioUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/songs/NIKI%20-%20High%20School%20in%20Jakarta.mp3",
        metadataUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/NIKI%20-%20High%20School%20in%20Jakarta.mp3_metadata.json",
        coverUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/NIKI%20-%20High%20School%20in%20Jakarta_cover.jpg"
    },
    {
        audioUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/songs/NIKI%20-%20You%27ll%20Be%20in%20My%20Heart.mp3",
        metadataUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/NIKI%20-%20You%27ll%20Be%20in%20My%20Heart.mp3_metadata.json",
        coverUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/NIKI%20-%20You%27ll%20Be%20in%20My%20Heart_cover.jpg"
    },
    {
        audioUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/songs/NIKI%20-%20lowkey.mp3",
        metadataUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/NIKI%20-%20lowkey.mp3_metadata.json",
        coverUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/NIKI%20-%20lowkey_cover.jpg"
    },
    {
        audioUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/songs/Portugal.%20The%20Man%20-%20Glide.mp3",
        metadataUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/Portugal.%20The%20Man%20-%20Glide.mp3_metadata.json",
        coverUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/Portugal.%20The%20Man%20-%20Glide_cover.jpg"
    },
    {
        audioUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/songs/The%20Chainsmokers%20-%20Closer.mp3",
        metadataUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/The%20Chainsmokers%20-%20Closer.mp3_metadata.json",
        coverUrl: "https://2bmmciti2gxbcygh.public.blob.vercel-storage.com/metadata/The%20Chainsmokers%20-%20Closer_cover.jpg"
    }
];

export const getCloudConfigs = (): CloudSongConfig[] => {
    return CLOUD_CONFIGS;
};
