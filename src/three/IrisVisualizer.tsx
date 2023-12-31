// Adapted from https://github.com/tariqksoliman/Vissonance/blob/master/scripts/visualizers/Iris.js
/**
 * MIT License

Copyright (c) 2020 Tariq Soliman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import { RefObject, useEffect, useMemo, useRef } from "react";
import { IrisVisualizerLayer } from "../stores/layers";
import {
  Color,
  Matrix4,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
} from "three";
import { useFrame } from "@react-three/fiber";
import { Spectrum } from "./SpectrumUtil";
import { getFrequencyData, useAudioStore } from "../stores/audio";
import { Billboard, useAspect, useFBO } from "@react-three/drei";

const vertexShader = `
varying vec4 pos;
void main() {
  pos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec3 col;
varying vec4 pos;
void main() {
  gl_FragColor = vec4(-pos.z/180.0*col.r, -pos.z/180.0*col.g, -pos.z/180.0*col.b, 1.0);
}
`;

function getLoudness(arr: Uint8Array) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]!;
  }
  return sum / arr.length;
}

export function VizComp({
  numberOfBars,
  i,
  opacity,
  spectrum,
  groupRef,
  color,
}: {
  numberOfBars: number;
  i: number;
  opacity: number;
  spectrum: RefObject<Spectrum>;
  groupRef: RefObject<Object3D>;
  color?: string;
}) {
  const shaderMaterialRef = useRef<ShaderMaterial>(null!);

  const firstMeshRef = useRef<Mesh>(null!);
  const secondMeshRef = useRef<Mesh>(null!);

  useEffect(() => {
    firstMeshRef.current.geometry.rotateX(Math.PI / 1.8);
    secondMeshRef.current.geometry.rotateX(Math.PI / 1.8);

    firstMeshRef.current.geometry.applyMatrix4(
      new Matrix4().makeTranslation(0, 60, 0),
    );
    secondMeshRef.current.geometry.applyMatrix4(
      new Matrix4().makeTranslation(0, 60, 0),
    );
  }, []);

  useFrame(() => {
    if (!useAudioStore.getState().isPlaying) return;

    const dataArray = getFrequencyData();

    const loudness = getLoudness(dataArray);

    const visualArray = spectrum.current!.GetVisualBins(
      dataArray,
      numberOfBars,
      4,
      1300,
    );

    const group = groupRef.current!;

    if (group) {
      for (let i = 0; i < visualArray.length / 2; i++) {
        const visualArrayI = visualArray[i]!;

        const groupChildrenFirst = group.children[i * 2]!;
        const groupChildrenSecond = group.children[i * 2 + 1]!;

        groupChildrenFirst.geometry.attributes.position.array[7] =
          visualArrayI / 2 + (65 + loudness / 1.5);
        groupChildrenFirst.geometry.attributes.position.array[10] =
          visualArrayI / 2 + (65 + loudness / 1.5);
        groupChildrenFirst.geometry.attributes.position.needsUpdate = true;

        groupChildrenSecond.geometry.attributes.position.array[7] =
          visualArrayI / 2 + (65 + loudness / 1.5);
        groupChildrenSecond.geometry.attributes.position.array[10] =
          visualArrayI / 2 + (65 + loudness / 1.5);
        groupChildrenSecond.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  const uniforms = useMemo(
    () => ({
      col: {
        value: color ? new Color(color) : new Color(`hsl(100, 100%, 50%)`),
      },
    }),
    [color],
  );

  const shaderMaterial = (
    <shaderMaterial
      key={color}
      ref={shaderMaterialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      depthTest={false}
      depthWrite={false}
      transparent
      opacity={opacity}
    />
  );

  return (
    <>
      <mesh
        ref={firstMeshRef}
        rotation-z={i * ((Math.PI * 2) / numberOfBars) + Math.PI / numberOfBars}
      >
        <planeGeometry args={[3, 500, 1]} />
        {shaderMaterial}
      </mesh>
      <mesh
        ref={secondMeshRef}
        rotation-z={
          -i * ((Math.PI * 2) / numberOfBars) - Math.PI / numberOfBars
        }
      >
        <planeGeometry args={[3, 500, 1]} />
        {shaderMaterial}
      </mesh>
    </>
  );
}

export function IrisVisualizer({
  numberOfBars = 128,
  layer,
  index,
}: {
  numberOfBars?: number;
  layer: IrisVisualizerLayer;
  index: number;
}) {
  const { width, height, scale, opacity, x, y, color } = layer;

  const spectrumRef = useRef(new Spectrum());
  const groupRef = useRef<Object3D>(null!);

  const buffer = useFBO();

  const sceneRef = useRef<Scene>(null!);
  const cameraRef = useRef<PerspectiveCamera>(null!);

  useFrame(({ gl }) => {
    if (!sceneRef.current || !cameraRef.current) return;
    gl.setRenderTarget(buffer);
    gl.render(sceneRef.current, cameraRef.current);
    gl.setRenderTarget(null);
  });

  return (
    <Billboard>
      <scene frustumCulled={false} ref={sceneRef}>
        <perspectiveCamera
          ref={cameraRef}
          scale={useAspect(width, height, 0.005)}
          position={[0, 0, 1]}
        />
        <object3D ref={groupRef}>
          {[...Array(numberOfBars / 2)].map((_, i) => {
            return (
              <VizComp
                numberOfBars={numberOfBars}
                i={i}
                opacity={opacity}
                spectrum={spectrumRef}
                groupRef={groupRef}
                key={i}
                color={color}
              />
            );
          })}
        </object3D>
      </scene>
      <mesh
        scale={useAspect(width, height, scale)}
        position={[x, y, index]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1, 1, 1]} />
        <meshBasicMaterial
          depthTest={false}
          depthWrite={false}
          transparent
          opacity={opacity}
          map={buffer.texture}
        />
      </mesh>
    </Billboard>
  );
}
