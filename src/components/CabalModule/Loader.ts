import { Face, Vector4, Vertex } from './Common';
import { AN, EBM, GE, Influence, Material, Mesh, MT, SK } from './ebm';
import * as THREE from 'three';
import * as dat from 'dat.gui'; // 引入 dat.GUI
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';

export class CabalLoader {
    mixers: THREE.AnimationMixer[] = []; // 动画混合器
    actions: THREE.AnimationAction[] = []; // 存储所有模型的动画 actions
    private clock: THREE.Clock;
    gui: dat.GUI; // GUI 实例
    currentActionIndex: number = 0; // 当前动画的索引

    constructor(private scene: THREE.Scene) {
        this.clock = new THREE.Clock();
        // 只在浏览器环境中初始化 dat.GUI
        if (typeof window !== 'undefined') {
            this.gui = new dat.GUI(); // 初始化 GUI
            // 设置 GUI 距离顶部 50px
            const guiElement = document.querySelector('.dg.main') as HTMLElement; // 强制转换为 HTMLElem
            if (guiElement) {
                guiElement.style.position = 'absolute'; // 确保 GUI 是绝对定位
                guiElement.style.top = '100px'; // 设置距离顶部 50px
            }
        }
    }

    // 主加载方法
    async loadModel(ebm: EBM) {

        // 1. 解析贴图
        const materials = this.parseMaterials(ebm.materials_and_textures);
        // 2. 解析骨骼
        const skeleton = this.parseSkeleton(ebm.skeleton);
        // 3. 创建网格并绑定骨骼
        const meshes = this.parseGeometry(ebm.geometry, materials, skeleton);
        // 4. 为每个 SkinnedMesh 创建独立的 AnimationMixer
        // 为所有 SkinnedMesh 创建共享的 AnimationMixer
        if (meshes.length > 0 && meshes[0] instanceof THREE.SkinnedMesh) {
            const skinnedMesh = meshes[0]; // 使用第一个 SkinnedMesh 作为代表
            const { mixer, actions } = this.parseAnimations(ebm.animations, skinnedMesh, skeleton);
            // 保存 mixer 和 actions
            this.mixers.push(mixer);
            this.actions = actions;

            // 默认播放第一个动画
            if (actions[0]) {
                actions[0].play();
            }
        }


        // 5. 添加到场景
        this.scene.add(...meshes);
        // 添加 GUI 控制
        this.setupGUI();
    }

    private setupGUI() {
        // 添加动画选择
        const actionOptions: { [key: string]: number } = {};
        this.actions.forEach((_, index) => {
            actionOptions[`Action ${index + 1}`] = index;
        });
        this.gui.add(this, 'currentActionIndex', actionOptions).name('Action').onChange((value: number) => {
            this.currentActionIndex = value;
            this.updateAction();
        });
    }

    private updateAction() {
        const action = this.actions[this.currentActionIndex];
        if (!action) return;
        // 停止所有动画
        this.actions.forEach(a => a.stop());
        // 播放选中的动画
        action.play();
    }

    parseSkeleton(sk: SK) {
        const bones: THREE.Bone[] = [];
        const boneInverses: THREE.Matrix4[] = [];
        // 创建骨骼 设置矩阵和父子关系
        sk.bones.forEach((boneData, index) => {
            const bone = new THREE.Bone();
            bone.name = boneData.id.text;

            const boneMatrix = threeMatrix4(boneData.bone_space_matrix.col);
            const parentMatrix = threeMatrix4(boneData.parent_bone_space_matrix.col);
            boneInverses.push(parentMatrix.invert())
            // 应用矩阵变换
            // const position = new THREE.Vector3();
            // const quaternion = new THREE.Quaternion();
            // const scale = new THREE.Vector3();
            // boneMatrix.decompose(position, quaternion, scale);
            // 应用坐标系转换
            // bone.position.copy(position);
            // bone.quaternion.copy(quaternion);

            // bone.matrixWorld.copy(parentMatrix);
            bone.matrix.copy(boneMatrix);
            bone.matrix.decompose(bone.position, bone.quaternion, bone.scale)

            // bone.matrixWorldAutoUpdate = false
            if (boneData.parent_bone_index !== -1) {
                const parentBone = bones[boneData.parent_bone_index];
                parentBone.add(bone);
            }
            bones.push(bone);
            // boneInverses.push(boneMatrix.invert())

        });
        return new THREE.Skeleton(bones, boneInverses);
    }

    // 在 Three.js 中，SkinnedMesh 用于绑定骨骼系统。你需要根据 Mesh 数据创建 SkinnedMesh
    private parseGeometry(ge: GE, materials: THREE.Material[], skeleton: THREE.Skeleton): (THREE.SkinnedMesh | THREE.Mesh)[] {
        return ge.meshes.map(meshData => {
            const geometry = this.ebm_read_mesh(meshData);
            const parent_id = meshData.root_bone_id;
            const world_matrix = meshData.world_matrix;
            const local_matrix = meshData.local_matrix;

            const material = materials[meshData.material_index];

            if (meshData.influences) {
                const { skinIndices, skinWeights } = this.calculateSkinData(meshData.influences);
                geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices.flat(), 4));
                geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights.flat(), 4));

                const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
                skinnedMesh.add(skeleton.bones[0]);
                skinnedMesh.bind(skeleton);
                skinnedMesh.name = meshData.id.text;
                // skinnedMesh.matrixWorld= threeMatrix4(local_matrix.col);
                // skinnedMesh.matrixWorld.decompose(convertPosition(skinnedMesh.position), convertRotation(skinnedMesh.quaternion), skinnedMesh.scale)


                this.scene.add(new THREE.SkeletonHelper(skinnedMesh));
                return skinnedMesh;
            } else {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.name = meshData.id.text;
                return mesh;
            }
        });
    }
    private calculateSkinData(influences: Influence[]): { skinIndices: number[][], skinWeights: number[][] } {
        const skinIndices: number[][] = [];
        const skinWeights: number[][] = [];

        influences.forEach((influence: any, boneIndex: number) => {
            influence.influence_for_bone.forEach((boneInfluence: any, i: number) => {
                boneInfluence.vertex_index.forEach((vertIdx: number, weightIdx: number) => {
                    if (!skinIndices[vertIdx]) {
                        skinIndices[vertIdx] = [i, i + 1, 0, 0];
                        skinWeights[vertIdx] = [1 - boneInfluence.weight[weightIdx], boneInfluence.weight[weightIdx], 0, 0];
                    }
                });
            });
        });

        skinWeights.forEach((weights, vertIdx) => {
            const sum = weights.reduce((a, b) => a + b, 0);
            if (sum > 0) {
                skinWeights[vertIdx] = weights.map(w => w / sum);
            }
        });

        return { skinIndices, skinWeights };
    }
    private ebm_read_mesh(meshe: Mesh): THREE.BufferGeometry {
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        meshe.vertices.forEach((vertex: Vertex) => {
            positions.push(vertex.position.x, vertex.position.y, vertex.position.z);
            normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z);
            uvs.push(vertex.uv.x, vertex.uv.y);
        });

        meshe.faces.forEach((face: Face) => {
            indices.push(face.vert1, face.vert2, face.vert3,);
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        return geometry;
    }

    // 材质
    private parseMaterials(mt: MT): THREE.Material[] {
        return mt.materials.map(material => {
            // 读取材质
            const threeMaterial = this.ebm_read_material(material);
            // 读取纹理
            const texture = this.ebm_read_texture(material);
            // 将纹理应用到材质的颜色（map）属性
            threeMaterial.map = texture;
            threeMaterial.needsUpdate = true;
            return threeMaterial;
        });
    }

    // 材质
    private ebm_read_material(material: Material) {
        const { ambient, diffuse, specular, emissive, power } = material.material_properties;
        //  MeshBasicMaterial MeshStandardMaterial MeshPhongMaterial
        return new THREE.MeshBasicMaterial({
            color: new THREE.Color(diffuse.r, diffuse.g, diffuse.b),
            opacity: diffuse.a,
            transparent: diffuse.a < 1, // Enable transparency if alpha < 1
            // emissive: new THREE.Color(emissive.r, emissive.g, emissive.b),
            // emissiveIntensity: emissive.a,
            // specular: new THREE.Color(specular.r, specular.g, specular.b),
            // shininess: power, // Shininess (specular power)
            side: THREE.DoubleSide,
        });
    }

    // 纹理 贴图
    private ebm_read_texture(material: Material) {
        const { texture } = material;
        const ddsLoader = new DDSLoader();
        const uint8Array = new Uint8Array(texture.data.data);
        const blob = new Blob([uint8Array], { type: 'image/dds' });
        const url = URL.createObjectURL(blob);
        // 使用 DDSLoader 加载纹理
        const threeTexture = ddsLoader.load(url, () => {
            URL.revokeObjectURL(url); // 加载完成后释放URL
        });
        threeTexture.name = texture.id.text;
        return threeTexture;
    }


    private parseAnimations(an: AN, skinnedMesh: THREE.SkinnedMesh, skeleton: THREE.Skeleton) {
        const { count, animations } = an;
        const actions: THREE.AnimationAction[] = []; // 存储所有的 AnimationAction
        // 创建动画混合器
        const mixer = new THREE.AnimationMixer(skinnedMesh);

        animations.forEach((animation) => {
            const tracks: THREE.KeyframeTrack[] = [];
            animation.transformations.forEach((transformation) => {
                const bone = skeleton.bones.find((b) => b.name === transformation.id.text);
                if (!bone) return;
                // 关键：使用 SkinnedMesh 的骨骼路径
                // const bonePath = `${skinnedMesh.uuid}.skeleton.bones[${bone.name}]`;

                // 处理平移动画（使用 VectorKeyframeTrack）
                if (transformation.translations.length > 0) {
                    const times: number[] = [];
                    const values: number[] = [];
                    transformation.translations.forEach((translation) => {
                        times.push(translation.keyframe_second);

                        values.push(
                            translation.position.x,
                            translation.position.y,
                            translation.position.z,
                        );
                    });
                    const track = new THREE.VectorKeyframeTrack(
                        `.bones[${bone.name}].position`, // 直接操作 position
                        times,
                        values
                    );
                    tracks.push(track);
                }

                // 处理旋转动画（使用 QuaternionKeyframeTrack）
                if (transformation.rotations.length > 0) {
                    const times: number[] = [];
                    const values: number[] = [];
                    transformation.rotations.forEach((rotation) => {
                        times.push(rotation.keyframe_second);
                        // 确保 Quaternion 数据的顺序为 [x, y, z, w]

                        values.push(
                            rotation.position.x,
                            rotation.position.y,
                            rotation.position.z,
                            rotation.position.w,
                        );
                    });
                    const track = new THREE.QuaternionKeyframeTrack(
                        `.bones[${bone.name}].quaternion`, // 直接操作 quaternion
                        times,
                        values
                    );
                    tracks.push(track);
                }
            });
            // 创建动画剪辑
            const clip = new THREE.AnimationClip(animation.id.text, -1, tracks);
            const action = mixer.clipAction(clip);

            actions.push(action); // 将 action 存储到数组中
        });
        return { mixer, actions }; // 返回 mixer 和 actions;
    }

    update() {
        const delta = this.clock.getDelta();
        this.mixers.forEach(mixer => mixer.update(delta));
    }
}

// 坐标系转换函数（假设源数据是Z-up，转换为Three.js的Y-up）
function convertPosition(vertex: THREE.Vector3) {
    return new THREE.Vector3(vertex.x, vertex.z, vertex.y,);
}

// 旋转转换函数（根据具体数据格式调整）
function convertRotation(quat: THREE.Quaternion) {
    // 假设源数据使用不同旋转顺序或手性
    return new THREE.Quaternion(
        -quat.x,
        -quat.y,
        -quat.z,  // 交换Y/Z轴
        quat.w
    );
}


function threeMatrix4(col: Vector4[]) {
    return new THREE.Matrix4().fromArray(col.flatMap((col) => col.row));
    // return new THREE.Matrix4().set(
    //     col[0].row[0], col[1].row[0], col[2].row[0], col[3].row[0],
    //     col[0].row[1], col[1].row[1], col[2].row[1], col[3].row[1],
    //     col[0].row[2], col[1].row[2], col[2].row[2], col[3].row[2],
    //     col[0].row[3], col[1].row[3], col[2].row[3], col[3].row[3],
    // );
    // return new THREE.Matrix4().set(
    //     col[0].row[0], col[0].row[1], col[0].row[2], col[0].row[3],
    //     col[1].row[0], col[1].row[1], col[1].row[2], col[1].row[3],
    //     col[2].row[0], col[2].row[1], col[2].row[2], col[2].row[3],
    //     col[3].row[0], col[3].row[1], col[3].row[2], col[3].row[3],
    // );
}