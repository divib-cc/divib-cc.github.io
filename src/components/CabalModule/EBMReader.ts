import { Text, Colour, copyBuffer, Matrix4, Offset, readFloat32, readInt16, readInt32, readInt8, readString, readUint16, readUint32, readUint8, RGBA, Vector2, Vector3 } from "./Common";

export enum CID {
    MATERIAL = 0x41470201,
    MESH = 0x41470202,
    ARMATURE = 0x41470203,
    ANIMATION = 0x41470204,
    INFLUENCE = 0x41470205,
    MT2 = 0x20A38100,
}
// 混合模式
export enum RenderFlag {
    MULTIPLY = 0x04,                    // 乘法混合模式
    GRAIN_MERGE = 0x08,                 // 颗粒合并效果
    HARD_LIGHT = 0x09,                  // 硬光（高对比度光照）
    MULTIPLY_INVERT_PARENT = 0x0A,      // 父级反转后乘法（混合模式）
    ODD_FLICKER_EFFECT = 0x0E,          // 奇偶闪烁效果
    BELOW = 0x10,                       // 下层显示（图层顺序）
    SCREEN = 0x12,                      // 屏幕空间效果（如后期处理）
    SOME_PURE_WHITE_THING = 0x13,       // 某纯白材质/效果（需结合上下文）
    CHROME = 0x18,                      // 铬质感（镜面/金属光泽）
}

export class EBMReader {
    // 模型头部
    header: Header
    // 材料和纹理
    mt!: MT
    // 骨架
    sk!: SK
    // 几何结构
    ge!: GE
    // 动画
    an!: AN
    // 光效
    gl?: GL
    constructor(dataView: DataView) {
        // 初始化offset 对象形式是为了 在函数内自增偏移
        const offset: Offset = { n: 0 };
        const dataSize = dataView.byteLength;
        this.header = new Header(dataView, offset);
        // 判断 剩余读取字节数 > 4
        do {
            let cid = readUint32(dataView, offset);
            switch (cid) {
                // 材料和纹理
                case CID.MATERIAL:
                    this.mt = new MT(dataView, offset);

                    break;
                // 骨架
                case CID.ARMATURE:
                    this.sk = new SK(dataView, offset);

                    break;
                // 几何结构 骨架权重 需要用到 骨骼数量
                case CID.MESH:
                    this.ge = new GE(dataView, offset, this.sk.count);
                    break;
                // 动画
                case CID.ANIMATION:
                    this.an = new AN(dataView, offset);
                    break;
                default:
                    // 光效
                    offset.n -= 4;
                    // 读取完数据，退出循环
                    this.gl = new GL(dataView, offset);
                    break;
            }
        } while (dataSize - offset.n > 4);
    }
}

class Header {
    magic: number;
    fileVersion: number;
    model_flag: ModelFlag;
    alpha_threshold: number;
    unkus1: number;
    bound_min: Vector3;
    bound_max: Vector3;
    scale_percentage: number;
    constructor(dataView: DataView, offset: Offset) {
        this.magic = readUint32(dataView, offset);
        this.fileVersion = readUint16(dataView, offset);
        const modelFlag = readUint8(dataView, offset);
        this.model_flag = new ModelFlag(modelFlag);
        this.alpha_threshold = readInt8(dataView, offset);
        this.unkus1 = readUint16(dataView, offset);
        this.bound_min = new Vector3(dataView, offset);
        this.bound_max = new Vector3(dataView, offset);
        this.scale_percentage = readUint32(dataView, offset);
    }
}

class ModelFlag {
    unk_bit1: boolean;
    unk_bit2: boolean;
    additive_blend: boolean; // Ghost effect
    unk_bit3: boolean;
    unk_bit4: boolean;
    unk_bit5: boolean;
    unk_bit6: boolean;
    enable_alpha: boolean;
    constructor(modelFlag: number) {
        // 使用位运算提取每个标志位
        this.unk_bit1 = (modelFlag & 0x80) !== 0; // 0x80 表示第1位（最高位）
        this.unk_bit2 = (modelFlag & 0x40) !== 0; // 0x40 表示第2位
        this.additive_blend = (modelFlag & 0x20) !== 0; // 0x20 表示第3位
        this.unk_bit3 = (modelFlag & 0x10) !== 0; // 0x10 表示第4位
        this.unk_bit4 = (modelFlag & 0x08) !== 0; // 0x08 表示第5位
        this.unk_bit5 = (modelFlag & 0x04) !== 0; // 0x04 表示第6位
        this.unk_bit6 = (modelFlag & 0x02) !== 0; // 0x02 表示第7位
        this.enable_alpha = (modelFlag & 0x01) !== 0; // 0x01 表示第8位（最低位）
    }
}


class MT {
    count: number;
    materials: Material[] = [];
    constructor(dataView: DataView, offset: Offset) {
        this.count = readUint16(dataView, offset);
        for (let i = 0; i < this.count; i++) {
            this.materials.push(new Material(dataView, offset));
        }
    }
}

class Material {
    material_properties: MatProps;
    texture: PrimaryTexture;
    layer: SecondaryTexture;
    constructor(dataView: DataView, offset: Offset) {
        this.material_properties = new MatProps(dataView, offset);
        this.texture = new PrimaryTexture(dataView, offset);
        this.layer = new SecondaryTexture(dataView, offset);
    }
}

class MatProps {
    diffuse: RGBA;
    ambient: RGBA;
    specular: RGBA;
    emissive: RGBA;
    power: number;
    constructor(dataView: DataView, offset: Offset) {
        this.diffuse = new RGBA(dataView, offset);     // 读取环境光颜色 (RGBA)
        this.ambient = new RGBA(dataView, offset);     // 读取漫反射颜色 RGBA
        this.specular = new RGBA(dataView, offset);    // 读读取高光颜色 (RGBA)
        this.emissive = new RGBA(dataView, offset);    // 读取自发光颜色 (RGBA)
        this.power = readFloat32(dataView, offset);    // 读取高光强度
    }
}

class PrimaryTexture {
    id: Text;
    size: number;
    data: Uint8Array;
    is_faceted: boolean;
    scroll_speed: Vector2;
    constructor(dataView: DataView, offset: Offset) {
        this.id = new Text(dataView, offset);
        this.size = readInt32(dataView, offset);
        this.data = copyBuffer(dataView, offset, this.size);
        this.is_faceted = !!readInt8(dataView, offset);
        this.scroll_speed = new Vector2(dataView, offset);
    }
}

class SecondaryTexture {
    material_index: number;
    is_faceted: boolean;
    scroll_speed: Vector2;
    render_flags: RenderFlag;
    constructor(dataView: DataView, offset: Offset) {
        this.material_index = readInt32(dataView, offset);
        this.is_faceted = !!readInt8(dataView, offset);
        this.scroll_speed = new Vector2(dataView, offset);
        this.render_flags = readInt32(dataView, offset);
    }
}

class SK {
    count: number;
    bones: Bone[] = [];
    constructor(dataView: DataView, offset: Offset) {
        this.count = readUint16(dataView, offset);
        for (let i = 0; i < this.count; i++) {
            this.bones.push(new Bone(dataView, offset))
        }
    }
}

class Bone {
    id: Text;
    parent_bone_index: number;
    bone_space_matrix: Matrix4;
    parent_bone_space_matrix: Matrix4;
    constructor(dataView: DataView, offset: Offset) {
        this.id = new Text(dataView, offset);
        this.parent_bone_index = readInt32(dataView, offset);
        this.bone_space_matrix = new Matrix4(dataView, offset);
        this.parent_bone_space_matrix = new Matrix4(dataView, offset);
    }
}


class GE {
    count: number;
    meshes: Mesh[] = [];
    constructor(dataView: DataView, offset: Offset, bones: number) {
        this.count = readUint16(dataView, offset);
        for (let i = 0; i < this.count; i++) {
            this.meshes.push(new Mesh(dataView, offset, bones))
        }
    }
}

class Mesh {
    id: Text;
    world_matrix: Matrix4;
    local_matrix: Matrix4;
    root_bone_id: number;
    material_index: number;
    vertex_count: number;
    face_count: number;
    positions: number[] = [];
    normals: number[] = [];
    uvs: number[] = [];
    faces: number[] = [];
    chunk_id: CID;
    influence_count: number;
    influences: Influence[] = [];
    constructor(dataView: DataView, offset: Offset, bones: number) {
        this.id = new Text(dataView, offset);
        this.world_matrix = new Matrix4(dataView, offset);
        this.local_matrix = new Matrix4(dataView, offset);
        this.root_bone_id = readInt32(dataView, offset);
        this.material_index = readInt8(dataView, offset);
        this.vertex_count = readInt16(dataView, offset);
        this.face_count = readInt16(dataView, offset);

        for (let i = 0; i < this.vertex_count; i++) {
            for (let i = 0; i < 3; i++) { this.positions.push(readFloat32(dataView, offset)) }
            for (let i = 0; i < 3; i++) { this.normals.push(readFloat32(dataView, offset)) }
            for (let i = 0; i < 2; i++) { this.uvs.push(readFloat32(dataView, offset)) }
        }
        for (let i = 0; i < this.face_count * 3; i++) {
            this.faces.push(readUint16(dataView, offset));
        }
        this.chunk_id = readUint32(dataView, offset);
        this.influence_count = readInt16(dataView, offset);
        for (let i = 0; i < this.influence_count; i++) {
            // 传递 骨架 骨骼数量 skeleton
            this.influences.push(new Influence(dataView, offset, bones))
        }
    }
}

export class Influence {
    influence_for_bone: InfluenceBone[] = [];
    constructor(dataView: DataView, offset: Offset, bones: number) {
        // 这里 需要 骨架 skeleton.count
        for (let i = 0; i < bones; i++) {
            this.influence_for_bone.push(new InfluenceBone(dataView, offset));
        }
    }
}

class InfluenceBone {
    count: number;
    vertex_index: number[] = [];
    weight: number[] = [];
    constructor(dataView: DataView, offset: Offset) {
        this.count = readInt32(dataView, offset);
        for (let i = 0; i < this.count; i++) {
            this.vertex_index.push(readInt32(dataView, offset));
        }
        for (let i = 0; i < this.count; i++) {
            this.weight.push(readFloat32(dataView, offset));
        }
    }
}

class AN {
    count: number;
    animations: Animation[] = [];
    constructor(dataView: DataView, offset: Offset) {
        this.count = readUint16(dataView, offset);
        for (let i = 0; i < this.count; i++) {
            this.animations.push(new Animation(dataView, offset))
        }
    }
}

class Animation {
    id: Text;
    count: number;
    transformations: Transformation[] = [];
    constructor(dataView: DataView, offset: Offset) {
        this.id = new Text(dataView, offset);
        this.count = readUint16(dataView, offset);
        for (let i = 0; i < this.count; i++) {
            this.transformations.push(new Transformation(dataView, offset))
        }
    }
}
class Transformation {
    id: Text;
    translation_count: number;
    translations: Translation[] = [];
    rotation_count: number;
    rotations: Rotation[] = [];
    constructor(dataView: DataView, offset: Offset) {
        this.id = new Text(dataView, offset);
        this.translation_count = readUint32(dataView, offset);
        for (let i = 0; i < this.translation_count; i++) {
            this.translations.push(new Translation(dataView, offset));
        }
        this.rotation_count = readUint32(dataView, offset);
        for (let i = 0; i < this.rotation_count; i++) {
            this.rotations.push(new Rotation(dataView, offset));
        }
    }

}
export class Translation {
    keyframe_second: number;
    position: Vector3;
    constructor(dataView: DataView, offset: Offset) {
        this.keyframe_second = readFloat32(dataView, offset);
        this.position = new Vector3(dataView, offset);
    }
}

export class Rotation {
    keyframe_second: number;
    rotation: Quaternion;
    constructor(dataView: DataView, offset: Offset) {
        this.keyframe_second = readFloat32(dataView, offset);
        this.rotation = new Quaternion(dataView, offset);
    }
}

class Quaternion {
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

class GL {
    glow_colour: Colour[] = [];
    constructor(dataView: DataView, offset: Offset) {
        while (dataView.byteLength - offset.n >= 4) {
            this.glow_colour.push(new Colour(dataView, offset))
        }
    }
}
