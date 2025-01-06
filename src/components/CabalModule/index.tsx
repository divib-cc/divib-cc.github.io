import { Canvas, useFrame } from '@react-three/fiber';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { EBM, Material } from './ebm';
import { bike } from './bike';

function Ebm({ ebm }: { ebm: EBM }) {

  const meshes = ebm.geometry.meshes;
  const materials = ebm.materials_and_textures.materials;
  const animations = ebm.animations.animations; // 获取动画数据
  // 用于多个mesh的引用
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]); // 修改为 (THREE.Mesh | null)[]

  // 创建一个ref来保存动画混合器引用
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // 使用 useMemo 缓存 geometry 和 material，避免不必要的重新计算
  const getGeometry = (mesh: any) => {
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    mesh.vertices.forEach((vertex: any) => {
      positions.push(vertex.position.x, vertex.position.y, vertex.position.z);
      normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z);
      uvs.push(vertex.uv.x, vertex.uv.y);
    });

    mesh.faces.forEach((face: any) => {
      indices.push(face.vert1, face.vert2, face.vert3);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    return geometry;
  };

  const getTexture = (data: Uint8Array) => {
    const ddsLoader = new DDSLoader();
    const uint8Array = new Uint8Array(data);
    const blob = new Blob([uint8Array], { type: 'image/dds' });
    const url = URL.createObjectURL(blob);

    // 使用 DDSLoader 加载纹理
    const texture = ddsLoader.load(url, () => {
      URL.revokeObjectURL(url); // 加载完成后释放URL
    });

    return texture;
  };

  const getMaterial = (materials: Material[]) => {
    // 创建一个数组来保存材质的多个层次
    const layers: THREE.Texture[] = [];

    materials.forEach(material => {
      const texture = getTexture(material.texture.data.data); // 加载 DDS 或其他类型的纹理
      layers.push(texture);
    });

    // 创建一个材质，可以包含多个图层（例如 Diffuse、Specular、Normal 等）
    //  MeshBasicMaterial MeshStandardMaterial
    const material = new THREE.MeshStandardMaterial({
      map: layers[0], // 默认使用第一个图层作为主纹理
      // normalMap: layers[1], // 假设第二个图层是法线贴图
      // roughnessMap: layers[2], // 假设第三个图层是粗糙度贴图
      metalnessMap: layers[1], // 假设第四个图层是金属度贴图
      // 如果有更多图层，可以继续添加
      emissiveMap: layers[2], // 假设第五个图层是发光贴图
      side: THREE.DoubleSide,
      alphaTest: 0.0  // 设置为0.0，取消透明度裁剪 !! 否则会导致 黑色 武器 透明
    });

    return material;
  };

  // const handleAnimation = useCallback(() => {
  //   if (meshRefs.current.length > 0 && animations.length > 0) {
  //     const group = new THREE.AnimationObjectGroup();
  //     meshRefs.current.forEach((mesh) => {
  //       if (mesh) {
  //         group.add(mesh); // 确保每个 mesh 都被添加到 group 中
  //       }
  //     });
  //     const mixer = new THREE.AnimationMixer(group);

  //     animations.forEach(animationData => {
  //       const { id, transformations } = animationData;

  //       const keyframeTracks: THREE.KeyframeTrack[] = [];

  //       transformations.forEach(transformation => {
  //         if (transformation.translations.length > 0) {
  //           const times: number[] = [];
  //           const positions: number[] = [];
  //           transformation.translations.forEach(translation => {
  //             times.push(translation.keyframe_second);
  //             positions.push(translation.position.x, translation.position.y, translation.position.z);
  //           });

  //           const translationTrack = new THREE.VectorKeyframeTrack(
  //             `${id.text}.position`,  // 动画的路径：确保 id.text 是正确的目标路径
  //             times,
  //             positions
  //           );
  //           keyframeTracks.push(translationTrack);
  //         }

  //         if (transformation.rotations.length > 0) {
  //           const times: number[] = [];
  //           const rotations: number[] = [];
  //           transformation.rotations.forEach((rotation: any) => {
  //             times.push(rotation.keyframe_second);
  //             rotations.push(rotation.position.x, rotation.position.y, rotation.position.z, rotation.position.w);
  //           });

  //           const rotationTrack = new THREE.QuaternionKeyframeTrack(
  //             `${id.text}.rotation`,  // 动画的路径：确保 id.text 是正确的目标路径
  //             times,
  //             rotations
  //           );
  //           keyframeTracks.push(rotationTrack);
  //         }
  //       });

  //       const clip = new THREE.AnimationClip(id.text, -1, keyframeTracks);
  //       mixer.clipAction(clip).play();
  //     });

  //     mixerRef.current = mixer;
  //   }
  // }, [animations]);

  // useFrame((state, delta) => {
  //   if (mixerRef.current) {
  //     // 更新动画
  //     mixerRef.current.update(delta);
  //   }
  // });

  // 当组件挂载时启动动画
  // useEffect(() => {
  //   handleAnimation();
  // }, [handleAnimation]);
  const material = getMaterial(materials);


  return (
    <>
      {meshes.map((mesh, index) => {

        const geometry = getGeometry(mesh);

        return (
          <mesh
            ref={(el) => meshRefs.current[index] = el} // 为每个mesh绑定一个ref
            key={index}
            geometry={geometry}
            material={material}
            position={[0, 0, -200]}
            scale={1}
          />
        );
      })}
    </>
  );
}

const BikeModel: React.FC = () => {
  // const [ebmModels, setEbmModels] = useState<EBM[]>([]);

  // // Fetch EBM data and set the model
  // const getItemEbm = async () => {
  //   const url = '/static/bike_1.ebm'; // 假设文件在静态资源的 `/static` 文件夹中
  //   try {
  //     const response = await fetch(url);

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     // 获取文件的 ArrayBuffer（即二进制数据）
  //     const arrayBuffer = await response.arrayBuffer();
  //     const uint8Array = new Uint8Array(arrayBuffer);
  //     setEbmModels([new EBM(uint8Array)]);

  //   } catch (error) {
  //     console.error('Error fetching the file:', error);
  //   }
  // }

  // useEffect(() => {
  //   getItemEbm();
  // }, [getItemEbm]);

  return (
    <Canvas>
      <ambientLight intensity={2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} intensity={2} />
      {/* Add lights and controls */}
      {bike.map((ebm, i) => <Ebm ebm={ebm} key={i} />)}
      <OrbitControls
        enableZoom={true}
        minDistance={200}    // 最小缩放距离
        maxDistance={1000}   // 最大缩放距离
        target={[0, 0, 0]} // 设置相机的目标位置
      />
    </Canvas>
  );
};

export default BikeModel;
