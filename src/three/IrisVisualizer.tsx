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

import { RefObject, useEffect, useRef } from "react";
import { IrisVisualizerLayer } from "../stores/layers";
import { Color, Matrix4, Mesh, Object3D, ShaderMaterial } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Spectrum } from "./SpectrumUtil";
import { getFrequencyData, useAudioStore } from "../stores/audio";

const vertexShader = [
  "varying vec4 pos;",
  "void main() {",
  "pos = modelViewMatrix * vec4( position, 1.0 );",
  "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
  "}",
].join("\n");
const fragmentShader = [
  "uniform vec3 col;",
  "varying vec4 pos;",
  "void main() {",
  "gl_FragColor = vec4( -pos.z/180.0 * col.r, -pos.z/180.0 * col.g, -pos.z/180.0 * col.b, 1.0 );",
  "}",
].join("\n");

function getLoudness(arr: Uint8Array) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]!;
  }
  return sum / arr.length;
}

function modn(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function VizComp({
  numberOfBars,
  i,
  opacity,
  spectrum,
  groupRef,
}: {
  numberOfBars: number;
  i: number;
  opacity: number;
  spectrum: RefObject<Spectrum>;
  groupRef: RefObject<Object3D>;
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

    function setUniformColor(loudness: number) {
      const h = modn(250 - loudness * 2.2, 360);
      shaderMaterialRef.current.uniforms.col!.value = new Color(
        "hsl(" + h + ", 100%, 50%)",
      );
    }

    if (group) {
      for (let i = 0; i < visualArray.length / 2; i++) {
        //Left and right share the same material hence why we don't need i*2+1
        setUniformColor(loudness);

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

  const shaderMaterial = (
    <shaderMaterial
      ref={shaderMaterialRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={{
        col: {
          value: new Color(`hsl(100, 100%, 50%)`),
        },
      }}
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
  const { width, height, zoom, opacity, x, y } = layer;
  const { size } = useThree();

  const spectrumRef = useRef(new Spectrum());
  const groupRef = useRef<Object3D>(null!);

  return (
    <scene
      scale={[(width / size.width) * zoom, (height / size.height) * zoom, 1]}
      position={[
        x + width / 2 - size.width / 2,
        y + height / 2 - size.height / 2,
        index,
      ]}
      frustumCulled={false}
    >
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
            />
          );
        })}
      </object3D>
    </scene>
  );
}
