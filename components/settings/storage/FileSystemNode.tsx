
import React, { useState } from 'react';
import { 
    ChevronDown, 
    ChevronRight, 
    Folder, 
    File, 
    Cloud, 
    HardDrive, 
    Database, 
    CheckCircle, 
    Loader,
    Music
} from '../../Icons';
import { Song } from '../../../types';

interface FileSystemNodeProps {
    name: string;
    data: any;
    level?: number;
}

export const FileSystemNode: React.FC<FileSystemNodeProps> = ({ name, data, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Heuristic: Jika objek punya 'id' dan 'url', kita anggap ini adalah Song (File Leaf)
    const isFile = data && typeof data === 'object' && (data.id || data.isLeaf); 
    const paddingLeft = level * 16;

    // --- RENDER FILE (LEAF) ---
    if (isFile) {
        const song = data as Song & { isActiveCache?: boolean }; // Extend type check
        
        // Logika Visual: Active Cache vs Inactive
        const isActive = song.isActiveCache;
        const isCloud = song.isOnline;

        // Tentukan Warna & Style
        let textColor = "text-gray-500";
        let iconColor = "text-gray-400";
        let bgHover = "hover:bg-gray-50";

        if (isCloud) {
            if (isActive) {
                textColor = "text-emerald-700 font-bold shadow-green-100 drop-shadow-sm";
                iconColor = "text-emerald-500";
                bgHover = "hover:bg-emerald-50";
            } else {
                textColor = "text-gray-400 italic"; // Redup jika belum di-cache
                iconColor = "text-gray-300";
            }
        }

        // Tentukan Nama File untuk ditampilkan
        // Jika file lokal/asset, gunakan nama file asli jika ada. Jika cloud, gunakan Title - Artist
        let displayName = song.title;
        if (song.file?.name) {
            displayName = song.file.name;
        } else if (isCloud) {
             displayName = `${song.artist} - ${song.title}.${song.format?.toLowerCase() || 'mp3'}`;
        }

        return (
            <div 
                className={`flex items-center gap-2 py-2 px-2 rounded-lg text-xs md:text-sm transition-all cursor-default border-l-2 border-transparent ${bgHover}`}
                style={{ marginLeft: paddingLeft }}
            >
                {/* Icon Indikator */}
                <div className={`${iconColor} flex-shrink-0 transition-colors`}>
                    {isCloud ? (
                        isActive ? <CheckCircle size={14} /> : <Cloud size={14} />
                    ) : (
                        <File size={14} />
                    )}
                </div>

                {/* Nama File */}
                <span className={`truncate font-mono flex-1 ${textColor} transition-colors`}>
                    {displayName}
                </span>

                {/* Status Badge (Kanan) */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {isCloud && isActive && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-200 font-bold animate-pulse">
                            CACHED
                        </span>
                    )}
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                        {song.fileSize || 'Unknown'}
                    </span>
                </div>
            </div>
        );
    }

    // --- RENDER FOLDER ---
    const childrenKeys = Object.keys(data);
    const folderIcon = isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />;
    
    // Icon khusus berdasarkan nama folder
    let specificIcon = <Folder size={14} className="text-yellow-500 fill-yellow-100" />;
    let labelColor = "text-gray-700";

    if (name === 'Cloud' || name === 'Cache') {
        specificIcon = <Cloud size={14} className="text-sky-500" />;
        if(name === 'Cache') labelColor = "text-sky-700";
    } 
    if (name === 'Local' || name === 'Assets') specificIcon = <HardDrive size={14} className="text-indigo-500" />;
    if (name === 'Database') specificIcon = <Database size={14} className="text-emerald-500" />;
    if (name === 'Music') specificIcon = <Music size={14} className="text-rose-500" />;

    return (
        <div>
            <div 
                className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-100 rounded-lg cursor-pointer select-none text-sm font-bold ${labelColor} transition-colors`}
                style={{ marginLeft: paddingLeft }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-gray-400">{folderIcon}</span>
                {specificIcon}
                <span>{name}</span>
                <span className="text-[10px] text-gray-400 font-normal ml-2 bg-gray-50 px-1 rounded">
                    {childrenKeys.length} items
                </span>
            </div>
            
            {/* Render Children Rekursif */}
            {isOpen && (
                <div className="border-l border-gray-100 ml-2 relative">
                    {childrenKeys.map(key => (
                        <FileSystemNode key={key} name={key} data={data[key]} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};
