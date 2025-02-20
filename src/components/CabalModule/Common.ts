export interface Offset { n: number; }

// =====================通用读取函数=====================
export const copyBuffer = (dataView: DataView, offset: Offset, length: number): Uint8Array => {
    const bytes = new Uint8Array(dataView.buffer, offset.n, length);
    offset.n += length;
    return bytes;
}

export const readString = (dataView: DataView, offset: Offset): string => {
    const length = readUint16(dataView, offset);
    const bytes = new Uint8Array(dataView.buffer, offset.n, length);
    offset.n += length;
    return new TextDecoder().decode(bytes).replace(/\0.*$/g, '');
}

export function readUint8(dataView: DataView, offset: Offset): number {
    const value = dataView.getUint8(offset.n);
    offset.n += 1;
    return value;
}

export function readUint16(dataView: DataView, offset: Offset): number {
    const value = dataView.getUint16(offset.n, true);  // true for little-endian
    offset.n += 2;
    return value;
}

export function readUint32(dataView: DataView, offset: Offset): number {
    const value = dataView.getUint32(offset.n, true);  // true for little-endian
    offset.n += 4;
    return value;
}

export function readFloat32(dataView: DataView, offset: Offset): number {
    const value = dataView.getFloat32(offset.n, true);  // true for little-endian
    offset.n += 4;
    return value;
}

export function readInt8(dataView: DataView, offset: Offset): number {
    const value = dataView.getInt8(offset.n);
    offset.n += 1;
    return value;
}

export function readInt16(dataView: DataView, offset: Offset): number {
    const value = dataView.getInt16(offset.n, true);  // true for little-endian
    offset.n += 2;
    return value;
}

export function readInt32(dataView: DataView, offset: Offset): number {
    const value = dataView.getInt32(offset.n, true);  // true for little-endian
    offset.n += 4;
    return value;

}
// =====================结构体实现=====================
export class Vector2 {
    x: number;
    y: number;
    constructor(dataView: DataView, offset: Offset) {
        this.x = readFloat32(dataView, offset);
        this.y = readFloat32(dataView, offset);
    }
}

export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(dataView: DataView, offset: Offset) {
        this.x = readFloat32(dataView, offset);
        this.y = readFloat32(dataView, offset);
        this.z = readFloat32(dataView, offset);
    }
}

export class Vector4 {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(dataView: DataView, offset: Offset) {
        this.x = readFloat32(dataView, offset);
        this.y = readFloat32(dataView, offset);
        this.z = readFloat32(dataView, offset);
        this.w = readFloat32(dataView, offset);
    }
}

export class Matrix4 {
    col: number[] = [];
    constructor(dataView: DataView, offset: Offset) {
        for (let i = 0; i < 16; i++) {
            this.col.push(readFloat32(dataView, offset));
        }
    }
}

export class Face {
    a: number;
    b: number;
    c: number;
    constructor(dataView: DataView, offset: Offset) {
        this.a = readUint16(dataView, offset);
        this.b = readUint16(dataView, offset);
        this.c = readUint16(dataView, offset);
    }
}

export class RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(dataView: DataView, offset: Offset) {
        this.r = readFloat32(dataView, offset);
        this.g = readFloat32(dataView, offset);
        this.b = readFloat32(dataView, offset);
        this.a = readFloat32(dataView, offset);
    }
}

export class Colour {
    b: number;
    g: number;
    r: number;
    a: number;
    constructor(dataView: DataView, offset: Offset) {
        this.b = readInt8(dataView, offset);
        this.g = readInt8(dataView, offset);
        this.r = readInt8(dataView, offset);
        this.a = readInt8(dataView, offset);
    }
}