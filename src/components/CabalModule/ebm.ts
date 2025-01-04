//--------------------------------------##
// Game: CABAL Online
// File Format: EBM/ECH
// Description: Template for CABAL's model files
//--------------------------------------##
// Author: Yamachi
// Team: Forge
// Website: http://forge-dev.com
//--------------------------------------##
import { Colour, Face, Matrix, Rotation, Translation, Vector2, Vector3, Vertex, Text } from "./Common";

// Local Variables
let estType: string = "EBM";

// Enumerations
enum CID {
    MATERIAL = 0x41470201,
    MESH = 0x41470202,
    ARMATURE = 0x41470203,
    ANIMATION = 0x41470204,
    INFLUENCE = 0x41470205,
    MT2 = 0x20A38100,
}

// 2nd layer render flag
enum RenderFlag {
    MULTIPLY = 0x04,
    GRAIN_MERGE = 0x08,
    HARD_LIGHT = 0x09,
    MULTIPLY_INVERT_PARENT = 0x0A,
    ODD_FLICKER_EFFECT = 0x0E,
    BELOW = 0x10,
    SCREEN = 0x12,
    SOME_PURE_WHITE_THING = 0x13,
    CHROME = 0x18,
}

// Structures

// Model Flag Structure
export class ModelFlag {
    unk_bit1: boolean;
    unk_bit2: boolean;
    additive_blend: boolean; // Ghost effect
    unk_bit3: boolean;
    unk_bit4: boolean;
    unk_bit5: boolean;
    unk_bit6: boolean;
    enable_alpha: boolean;
}

// Header Structure
export class Header {
    unkb0: number;
    magic: number;
    unkb1: number;
    unkus0: number;
    model_flag: ModelFlag;
    alpha_threshold: number;
    unkus1: number;
    bound_min: Vector3;
    bound_max: Vector3;
    scale_percentage: number;
    chunk_id: CID;

}

// RGBA Structure
export class RGBA {
    r: number;
    g: number;
    b: number;
    a: number;

}

// Material Properties Structure
export class MatProps {
    ambient: RGBA;
    diffuse: RGBA;
    specular: RGBA;
    emissive: RGBA;
    power: number;

}

export class SecondaryTexture {
    material_index: number;
    is_faceted: boolean;
    scroll_speed: Vector2;
    render_flags: RenderFlag;

}

// Texture Structures
export class PrimaryTexture {
    id: Text;
    size: number;
    data: {data:Uint8Array,type:string};
    is_faceted: boolean;
    scroll_speed: Vector2;

}

export interface IndexedTexture {
    id: string;
    size: number;
    data: Uint8Array;
}

export class Material {
    material_properties: MatProps;
    texture: PrimaryTexture;
    layer: SecondaryTexture;


}

interface Material2 {
    material_properties: MatProps;
    texture: IndexedTexture;
}



// Influence Structures
class InfluenceBone {
    count: number;
    vertex_index: number[] = [];
    weight: number[] = [];

}

class Influence {
    influence_for_bone: InfluenceBone[] = [];

}


export class Mesh {
    id: Text;
    world_matrix: Matrix;
    local_matrix: Matrix;
    root_bone_id: number;
    material_index: number;
    vertex_count: number;
    face_count: number;
    vertices: Vertex[] = [];
    faces: Face[] = [];
    chunk_id?: CID;
    influence_count?: number;
    influences?: Influence[] = [];
    // 传递 骨架 skeleton


}

// Bone Structure
export class Bone {
    id: Text;
    parent_bone_index: number;
    bone_space_matrix: Matrix;
    parent_bone_space_matrix: Matrix;


}

// Transformation Structure
export class Transformation {
    id: Text;
    translation_count: number;
    translations: Translation[] = [];
    rotation_count: number;
    rotations: Rotation[] = [];
 
}
// 动画
export class Animation {
    id: Text;
    count: number;
    transformations: Transformation[] = [];


}

export class MT {
    count: number;
    materials: Material[] = [];
    chunk_id: CID;

}

interface MT2 {
    count: number;
    materials: Material2[];
    chunk_id: CID;
}

export class GE {
    count: number;
    meshes: Mesh[] = [];
    chunk_id: CID;

}

export class SK {
    count: number;
    bones: Bone[] = [];
    chunk_id: CID;

}

export class AN {
    count: number;
    animations: Animation[] = [];

}

export class GL {
    glow_colour: Colour[] = [];
   }

export class EBM {
    // 模型头部
    model_header: Header
    // 材料和纹理
    materials_and_textures: MT
    // 骨架
    skeleton: SK
    // 几何结构
    geometry: GE
    // 动画
    animations: AN
    // 光效
    glows?: GL
   
}



