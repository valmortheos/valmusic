
// Fungsi helper untuk mengambil palet warna (3 warna) dari gambar
export const getColorPalette = (imageSrc: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageSrc;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(['#6366f1', '#4f46e5', '#4338ca']); 
          return;
        }
  
        // Resize gambar kecil untuk performa, tapi cukup detail
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
  
        const imageData = ctx.getImageData(0, 0, 100, 100).data;
        const rgbValues: { r: number, g: number, b: number }[] = [];
  
        // Sampling pixel (step 5 untuk performa)
        for (let i = 0; i < imageData.length; i += 20) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            // Skip transparent pixels
            if (a < 128) continue;

            rgbValues.push({ r, g, b });
        }

        // Helper: Convert RGB to HSL to filter dark/white/gray pixels
        const rgbToHsl = (r: number, g: number, b: number) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return [h, s, l];
        };

        // Filter warna yang "membosankan" (terlalu gelap, terlalu putih, atau terlalu abu-abu)
        // Kecuali jika mayoritas gambar memang grayscale
        let vibrantColors = rgbValues.filter(c => {
            const [h, s, l] = rgbToHsl(c.r, c.g, c.b);
            // Syarat Vibrant: Tidak terlalu gelap (l>0.15), tidak terlalu terang (l<0.9), saturasi cukup (s>0.2)
            return l > 0.15 && l < 0.9 && s > 0.2;
        });

        // Fallback jika gambar monochrome/hitam putih (vibrant kosong)
        if (vibrantColors.length < 10) {
             vibrantColors = rgbValues.filter(c => {
                const [h, s, l] = rgbToHsl(c.r, c.g, c.b);
                return l > 0.1 && l < 0.9; // Ambil mid-tones saja
            });
        }

        // Simple quantization: Ambil 3 warna yang cukup berbeda jaraknya
        const finalColors: string[] = [];
        
        const colorDistance = (c1: {r:number,g:number,b:number}, c2: {r:number,g:number,b:number}) => {
            return Math.sqrt(Math.pow(c1.r-c2.r, 2) + Math.pow(c1.g-c2.g, 2) + Math.pow(c1.b-c2.b, 2));
        };

        if (vibrantColors.length > 0) {
            // Warna 1: Random sampling dari paruh awal array (seringkali area atas gambar)
            const c1 = vibrantColors[Math.floor(Math.random() * (vibrantColors.length / 2))];
            finalColors.push(`rgb(${c1.r},${c1.g},${c1.b})`);

            // Cari warna 2 yang beda jauh dari c1
            let c2 = vibrantColors[0];
            let maxDist = 0;
            for(let i=0; i<vibrantColors.length; i+=10) {
                const dist = colorDistance(c1, vibrantColors[i]);
                if (dist > maxDist) {
                    maxDist = dist;
                    c2 = vibrantColors[i];
                }
            }
            finalColors.push(`rgb(${c2.r},${c2.g},${c2.b})`);

            // Cari warna 3 yang beda dari c1 dan c2 (rata-rata)
            let c3 = vibrantColors[vibrantColors.length - 1];
             // Jika cuma sedikit, duplicate c1 atau c2
            finalColors.push(`rgb(${c3.r},${c3.g},${c3.b})`);
        } else {
            // Fallback total hitam/putih
            finalColors.push('#444444', '#888888', '#cccccc');
        }

        // Pastikan selalu ada 3 warna
        while(finalColors.length < 3) {
            finalColors.push(finalColors[0]);
        }

        resolve(finalColors);
      };
  
      img.onerror = () => {
        resolve(['#6366f1', '#4f46e5', '#4338ca']);
      };
    });
};

// Wrapper untuk backward compatibility
export const getDominantColor = async (imageSrc: string): Promise<string> => {
    const palette = await getColorPalette(imageSrc);
    return palette[0];
};
