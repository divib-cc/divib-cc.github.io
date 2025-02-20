import {
    BufferGeometry,
    LoadingManager,
    DefaultLoadingManager,
    FileLoader,
    Group,
    Mesh,
    Vector3,
    MeshPhongMaterial,
    Color,
    MixOperation,
    Texture,
    Material,
    Skeleton,
    AnimationClip,
    Bone,
    Matrix4,
    Float32BufferAttribute,
    SkinnedMesh,
    Uint16BufferAttribute,
    KeyframeTrack,
    Quaternion,
    VectorKeyframeTrack,
    QuaternionKeyframeTrack,
} from 'three';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { EBM, Influence, Rotation, Translation } from './ebm';
// Local Variables
// let estType: string = "EBM";

// Enumerations
enum CID {
    MATERIAL = 0x41470201,
    MESH = 0x41470202,
    ARMATURE = 0x41470203,
    ANIMATION = 0x41470204,
    INFLUENCE = 0x41470205,
    MT2 = 0x20A38100,
}
// 创建枚举值的集合（推荐，查询效率高）
const cidSet = new Set(Object.values(CID));
const isInCID = (value: number): boolean => cidSet.has(value);

// 混合模式
enum RenderFlag {
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

export class CabalLoader {
    private manager: LoadingManager;
    private fileLoader: FileLoader;

    constructor(manager: LoadingManager = DefaultLoadingManager) {
        this.manager = manager;
        this.fileLoader = new FileLoader(manager);
        this.fileLoader.setResponseType('arraybuffer'); // 新增这行
    }

    public load(url: string, onLoad: (group: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (error: any) => void) {
        this.fileLoader.load(url, (data) => {

            if (data instanceof ArrayBuffer) { // 现在data会是ArrayBuffer类型
                try {
                    const group = this.parse(data);

                    onLoad(group);
                } catch (e) {
                    onError?.(e);
                }
            } else {
                onError?.(new Error('Invalid binary data'));
            }
        }, onProgress, onError);
    }

    private parse(buffer: ArrayBuffer): Group {
        const dataView = new DataView(buffer);

        const ebm = new EBM(dataView);
        console.log(ebm)
        const group = new Group();
        const materials = createMaterial(ebm);
        const skeleton = createSkeleton(ebm);
        const meshs = createMesh(ebm, materials, skeleton);
        group.add(...meshs);
        const animations = createAnimations(ebm, skeleton);
        group.animations = animations;
        return group;
    }
}

const createSkeleton = (ebm: EBM): Skeleton => {
    const bones: Bone[] = [];
    ebm.sk.bones.forEach(boneData => {
        const { id, parent_bone_index, bone_space_matrix, parent_bone_space_matrix } = boneData;
        const bone = new Bone();
        bone.name = id;
        const worldMatrix = new Matrix4().fromArray(bone_space_matrix.col).invert();
        bone.matrix.copy(worldMatrix);
        if (parent_bone_index !== -1) {
            const localMatrix = new Matrix4().fromArray(parent_bone_space_matrix.col).invert().multiply(worldMatrix);
            bone.matrix.copy(localMatrix);
            bones[parent_bone_index].add(bone);
        }
        bone.matrix.decompose(bone.position, bone.quaternion, bone.scale)
        bones.push(bone);
    })
    return new Skeleton(bones);
}

const createMesh = (ebm: EBM, materials: Material[], skeleton: Skeleton) => {
    return ebm.ge.meshes.map(meshData => {
        const { positions, normals, uvs, faces, influence_count, influences, material_index } = meshData;
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
        geometry.setIndex(faces);

        let mesh: Mesh | SkinnedMesh;
        if (influence_count === 0) {
            mesh = new Mesh(geometry, materials[material_index])
        } else {
            mesh = new SkinnedMesh(geometry, materials[material_index]);
            // 骨骼权重
            setupSkinnedMesh(mesh as SkinnedMesh, influences, skeleton);
        }
        return mesh;
    })
}

const setupSkinnedMesh = (mesh: SkinnedMesh, influences: Influence[], skeleton: Skeleton): void => {
    // 筛选根骨骼数组
    const rootBones = skeleton.bones.filter(bone => !(bone.parent instanceof Bone));
    // 添加根骨骼 绑定骨架
    mesh.add(...rootBones);
    mesh.bind(skeleton);
    // 初始化蒙皮索引和权重
    const skinIndices: number[][] = [];
    const skinWeights: number[][] = [];

    influences.forEach((influence, boneIndex: number) => {
        influence.influence_for_bone.forEach((boneInfluence, i: number) => {
            boneInfluence.vertex_index.forEach((vertIdx: number, weightIdx: number) => {
                const weight = boneInfluence.weight[weightIdx];
                // 如果该顶点索引不存在，则初始化为空数组
                if (!skinIndices[vertIdx]) {
                    skinIndices[vertIdx] = [];
                    skinWeights[vertIdx] = [];
                }
                // 如果该顶点已有影响，且影响数还未达到上限（最多四个），则添加
                if (skinIndices[vertIdx].length < 4) {
                    skinIndices[vertIdx].push(i);  // 将骨骼索引添加到该顶点的影响中
                    skinWeights[vertIdx].push(weight);  // 将权重添加到该顶点的影响中
                }
            });
        });
    });

    // 确保每个顶点最多有4个骨骼影响
    for (let i = 0; i < skinIndices.length; i++) {
        if (skinIndices[i].length < 4) {
            // 补充至4个，未填充的部分设置为0
            while (skinIndices[i].length < 4) {
                skinIndices[i].push(0);  // 假设0表示无效的骨骼索引
                skinWeights[i].push(0);  // 假设0表示权重为0
            }
        }
    }
    // 将数据转换为平面数组并设置到geometry中
    mesh.geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices.flat(), 4));
    mesh.geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights.flat(), 4));
}




const createMaterial = (ebm: EBM): Material[] => {
    const { materials } = ebm.mt;
    return materials.map(materialData => {
        const { diffuse, ambient, specular, emissive, power } = materialData.material_properties;
        // 加载纹理
        const texture = loadDDSTexture(materialData.texture.data);
        // 兼容传统材质MeshBasicMaterial
        return new MeshPhongMaterial({
            name: materialData.texture.id,
            map: texture,
            color: new Color(diffuse.r, diffuse.g, diffuse.b), // 漫反射
            opacity: diffuse.a, // 透明度（需要开启 transparent）
            transparent: diffuse.a < 1.0, // 自动判断是否需要透明
            specular: new Color(specular.r, specular.g, specular.b), // 高光颜色
            // 处理 specular.a - 通过混合系数间接实现高光透明度
            combine: MixOperation,       // 启用颜色混合
            reflectivity: specular.a,    // 将 specular.a 映射到反射率（示例比例）
            emissive: new Color(emissive.r, emissive.g, emissive.b), // 自发光
            emissiveIntensity: emissive.a, // 使用 alpha 通道作为发光强度
            shininess: power, // 高光强度
            flatShading: materialData.texture.is_faceted, // 平面着色
            // userData: { matProps, primaryTexture, secondaryTexture }
        });

    })
}

const loadDDSTexture = (data: Uint8Array<ArrayBufferLike>): Texture => {
    const ddsLoader = new DDSLoader();
    const blob = new Blob([data], { type: 'image/dds' });
    const url = URL.createObjectURL(blob);
    return ddsLoader.load(url, () => URL.revokeObjectURL(url));
}


const createAnimations = (ebm: EBM, skeleton: Skeleton): AnimationClip[] => {
    return ebm.an.animations.map(anim => {
        const tracks: KeyframeTrack[] = [];

        anim.transformations.forEach(transformation => {
            const bone = skeleton.bones.find(b => b.name === transformation.id);
            if (!bone) return;
            // 获取父级变换信息
            const parentMatrix = bone.parent?.matrixWorld || new Matrix4();
            const parentPos = new Vector3();
            const parentQuat = new Quaternion();
            const parentScale = new Vector3();
            parentMatrix.decompose(parentPos, parentQuat, parentScale);
            // 位置轨迹
            const positionTrack = createPositionTrack(transformation.translations, bone, parentMatrix);
            if (positionTrack) tracks.push(positionTrack);

            // 旋转轨迹
            const rotationTrack = createRotationTrack(transformation.rotations, bone, parentQuat);
            if (rotationTrack) tracks.push(rotationTrack);
        });

        return new AnimationClip(anim.id, -1, tracks);
    });
}
const createPositionTrack = (translations: Translation[], bone: Bone, parentMatrix: Matrix4): VectorKeyframeTrack => {
    const times = translations.map(t => t.keyframe_second);
    const values = translations.flatMap(k => {
        const position = new Vector3(k.position.x, k.position.y, k.position.z);
        const normalized = position.applyMatrix4(parentMatrix.clone().invert());
        return [normalized.x, normalized.y, normalized.z];
    });
    return new VectorKeyframeTrack(`${bone.name}.position`, times, values);
}

const createRotationTrack = (rotations: Rotation[], bone: Bone, parentQuat: Quaternion): QuaternionKeyframeTrack => {
    const times = rotations.map(r => r.keyframe_second);
    const values = rotations.flatMap(k => {
        const relative = new Quaternion(k.rotation.x, k.rotation.y, k.rotation.z, k.rotation.w).conjugate();
        return parentQuat.clone().conjugate().multiply(relative).toArray();
    });
    return new QuaternionKeyframeTrack(`${bone.name}.quaternion`, times, values);
}