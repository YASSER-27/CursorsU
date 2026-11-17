// Universal Windows Cursor (.CUR, .ICO, .ANI) Parser for cursors U

function parseBmpOrPng(dataBytes, width, height) {
  return new Promise((resolve, reject) => {
    // Check if image data is PNG
    if (
      dataBytes.length > 8 &&
      dataBytes[0] === 0x89 &&
      dataBytes[1] === 0x50 &&
      dataBytes[2] === 0x4e &&
      dataBytes[3] === 0x47
    ) {
      const blob = new Blob([dataBytes], { type: "image/png" });
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load PNG frame inside cursor"));
      img.src = URL.createObjectURL(blob);
      return;
    }

    // Otherwise it's a DIB BMP (BITMAPINFOHEADER)
    try {
      const dibView = new DataView(dataBytes.buffer, dataBytes.byteOffset, dataBytes.byteLength);
      const biSize = dibView.getUint32(0, true);
      const biWidth = dibView.getInt32(4, true);
      let biHeight = dibView.getInt32(8, true);
      // In ICO/CUR, biHeight includes both XOR mask and AND mask, so actual height is biHeight / 2
      const actualHeight = Math.abs(biHeight) / 2;
      const biPlanes = dibView.getUint16(12, true);
      const biBitCount = dibView.getUint16(14, true);
      const biCompression = dibView.getUint32(16, true);
      const numColors = biBitCount <= 8 ? dibView.getUint32(32, true) || (1 << biBitCount) : 0;
      const paletteSize = numColors * 4;

      // Wrap DIB with a valid 14-byte BITMAPFILEHEADER to decode natively
      const fileHeaderSize = 14;
      const offBits = fileHeaderSize + biSize + paletteSize;
      const fileSize = fileHeaderSize + dataBytes.byteLength;

      const fullBmp = new Uint8Array(fileSize);
      const bmpView = new DataView(fullBmp.buffer);

      // 'BM' signature
      bmpView.setUint8(0, 0x42);
      bmpView.setUint8(1, 0x4d);
      bmpView.setUint32(2, fileSize, true); // Size
      bmpView.setUint32(6, 0, true); // Reserved
      bmpView.setUint32(10, offBits, true); // Offset to image bits

      // Copy DIB data
      fullBmp.set(dataBytes, fileHeaderSize);

      // Patch the height in the copied DIB header to actualHeight
      bmpView.setInt32(fileHeaderSize + 8, actualHeight, true);

      const blob = new Blob([fullBmp], { type: "image/bmp" });
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback: manually parse 32-bit RGBA if BMP decoder fails
        if (biBitCount === 32 && biCompression === 0) {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = biWidth;
            canvas.height = actualHeight;
            const ctx = canvas.getContext("2d");
            const imgData = ctx.createImageData(biWidth, actualHeight);
            const pixels = imgData.data;
            const pixelOffset = biSize + paletteSize;

            for (let row = 0; row < actualHeight; row++) {
              const srcRow = actualHeight - 1 - row; // BMP is bottom-up
              for (let col = 0; col < biWidth; col++) {
                const srcIdx = pixelOffset + (srcRow * biWidth + col) * 4;
                const dstIdx = (row * biWidth + col) * 4;
                pixels[dstIdx] = dataBytes[srcIdx + 2]; // R
                pixels[dstIdx + 1] = dataBytes[srcIdx + 1]; // G
                pixels[dstIdx + 2] = dataBytes[srcIdx]; // B
                pixels[dstIdx + 3] = dataBytes[srcIdx + 3]; // A
              }
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas);
            return;
          } catch (e) {}
        }
        reject(new Error("Failed to decode BMP cursor frame"));
      };
      img.src = URL.createObjectURL(blob);
    } catch (err) {
      reject(err);
    }
  });
}

export async function parseCur(buffer, targetSize = 48) {
  const view = new DataView(buffer);
  const reserved = view.getUint16(0, true);
  const type = view.getUint16(2, true); // 1 = ICO, 2 = CUR
  const count = view.getUint16(4, true);

  if (reserved !== 0 || (type !== 1 && type !== 2) || count < 1) {
    throw new Error("Invalid .CUR or .ICO format header");
  }

  // Read directory entry 0
  const width = view.getUint8(6) || 256;
  const height = view.getUint8(7) || 256;
  const hotX = type === 2 ? view.getUint16(10, true) : Math.floor(width / 2);
  const hotY = type === 2 ? view.getUint16(12, true) : Math.floor(height / 2);
  const bytesInRes = view.getUint32(14, true);
  const imageOffset = view.getUint32(18, true);

  const dataSlice = new Uint8Array(buffer, imageOffset, bytesInRes);
  const imgSource = await parseBmpOrPng(dataSlice, width, height);

  // Render into normalized canvas of targetSize
  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(imgSource, 0, 0, targetSize, targetSize);

  // Scale hotspot if needed
  const scale = targetSize / (width || 32);
  const scaledHotX = Math.max(0, Math.min(targetSize - 1, Math.round(hotX * scale)));
  const scaledHotY = Math.max(0, Math.min(targetSize - 1, Math.round(hotY * scale)));

  return {
    frames: [canvas],
    hot: [scaledHotX, scaledHotY],
    animated: false,
    dur: 100
  };
}

export async function parseAni(buffer, targetSize = 48) {
  const bytes = new Uint8Array(buffer);
  const str = (offset, len) => String.fromCharCode(...bytes.slice(offset, offset + len));

  if (str(0, 4) !== "RIFF" || str(8, 4) !== "ACON") {
    throw new Error("Invalid .ANI file (missing RIFF ACON signature)");
  }

  let offset = 12;
  const length = buffer.byteLength;
  let cFrames = 0;
  let jifRate = 10;
  const rawIconBuffers = [];

  while (offset + 8 <= length) {
    const chunkId = str(offset, 4);
    const chunkLen = new DataView(buffer, offset + 4, 4).getUint32(0, true);
    const chunkDataOffset = offset + 8;

    if (chunkId === "anih") {
      const anihView = new DataView(buffer, chunkDataOffset, chunkLen);
      cFrames = anihView.getUint32(4, true);
      jifRate = anihView.getUint32(28, true) || 10;
    } else if (chunkId === "LIST") {
      const listType = str(chunkDataOffset, 4);
      if (listType === "fram") {
        // Parse subchunks inside fram list
        let subOffset = chunkDataOffset + 4;
        const listEnd = chunkDataOffset + chunkLen;
        while (subOffset + 8 <= listEnd) {
          const subId = str(subOffset, 4);
          const subLen = new DataView(buffer, subOffset + 4, 4).getUint32(0, true);
          if (subId === "icon") {
            const iconData = buffer.slice(subOffset + 8, subOffset + 8 + subLen);
            rawIconBuffers.push(iconData);
          }
          subOffset += 8 + subLen + (subLen % 2); // Word aligned
        }
      }
    }

    offset += 8 + chunkLen + (chunkLen % 2);
  }

  if (rawIconBuffers.length === 0) {
    throw new Error("No frames found inside .ANI file");
  }

  const parsedFrames = [];
  let masterHot = [2, 2];

  for (let i = 0; i < rawIconBuffers.length; i++) {
    try {
      const curResult = await parseCur(rawIconBuffers[i], targetSize);
      parsedFrames.push(curResult.frames[0]);
      if (i === 0) masterHot = curResult.hot;
    } catch (e) {
      console.warn("Could not parse frame", i, e);
    }
  }

  if (parsedFrames.length === 0) {
    throw new Error("Failed to decode frames in .ANI file");
  }

  // Normalize to 3 frames if fewer
  while (parsedFrames.length < 3) {
    const copy = document.createElement("canvas");
    copy.width = targetSize;
    copy.height = targetSize;
    const ctx = copy.getContext("2d");
    ctx.drawImage(parsedFrames[parsedFrames.length - 1], 0, 0);
    parsedFrames.push(copy);
  }

  const durMs = Math.max(30, Math.min(500, Math.round((jifRate / 60) * 1000)));

  return {
    frames: parsedFrames.slice(0, 3),
    hot: masterHot,
    animated: true,
    dur: durMs
  };
}

export async function parseCursorFile(file, targetSize = 48) {
  const buffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  if (name.endsWith(".ani")) {
    return parseAni(buffer, targetSize);
  } else if (name.endsWith(".cur") || name.endsWith(".ico")) {
    return parseCur(buffer, targetSize);
  } else if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp") || name.endsWith(".gif")) {
    // Standard image fallback
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        resolve({
          frames: [canvas],
          hot: [2, 2],
          animated: false,
          dur: 100
        });
      };
      img.onerror = () => reject(new Error("Failed to load image file"));
      img.src = URL.createObjectURL(file);
    });
  } else {
    // Try RIFF or CUR detection by header bytes
    const u8 = new Uint8Array(buffer, 0, 4);
    if (u8[0] === 0x52 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x46) {
      return parseAni(buffer, targetSize);
    }
    return parseCur(buffer, targetSize);
  }
}
