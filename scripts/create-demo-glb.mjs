import fs from "node:fs";
import path from "node:path";

const nodes = ["layer-cover", "layer-comfort", "layer-responsive", "layer-latex", "layer-support"];
const positions = [];
const indices = [];
const positionViews = [];
const indexViews = [];
for (let layer = 0; layer < nodes.length; layer += 1) {
  const y = (layer - 2) * 0.28;
  const halfX = 1.55;
  const halfY = 0.11;
  const halfZ = 0.85;
  const positionOffset = positions.length * 4;
  const indexOffset = indices.length * 2;
  positions.push(
    -halfX, y - halfY, -halfZ, halfX, y - halfY, -halfZ, halfX, y + halfY, -halfZ, -halfX, y + halfY, -halfZ,
    -halfX, y - halfY, halfZ, halfX, y - halfY, halfZ, halfX, y + halfY, halfZ, -halfX, y + halfY, halfZ,
  );
  indices.push(...[0, 1, 2, 0, 2, 3, 1, 5, 6, 1, 6, 2, 5, 4, 7, 5, 7, 6, 4, 0, 3, 4, 3, 7, 3, 2, 6, 3, 6, 7, 4, 5, 1, 4, 1, 0]);
  positionViews.push({ offset: positionOffset, length: 24 * 4 });
  indexViews.push({ offset: indexOffset, length: 36 * 2 });
}
const positionBytes = Buffer.from(new Float32Array(positions).buffer);
const indexBytes = Buffer.from(new Uint16Array(indices).buffer);
const bin = Buffer.concat([positionBytes, indexBytes]);
const json = {
  asset: { version: "2.0", generator: "Thang Long local demo" },
  scene: 0,
  scenes: [{ nodes: nodes.map((_, index) => index) }],
  nodes: nodes.map((name, index) => ({ name, mesh: index })),
  meshes: nodes.map((_, index) => ({ primitives: [{ attributes: { POSITION: index * 2 }, indices: index * 2 + 1, material: index }] })),
  materials: nodes.map((_, index) => ({ name: `demo-material-${index}`, pbrMetallicRoughness: { baseColorFactor: [0.24 + index * 0.04, 0.28 + index * 0.03, 0.22 + index * 0.02, 1], roughnessFactor: 0.8 } })),
  buffers: [{ byteLength: bin.byteLength }],
  bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: positionBytes.byteLength, target: 34962 }, { buffer: 0, byteOffset: positionBytes.byteLength, byteLength: indexBytes.byteLength, target: 34963 }, ...positionViews.map((view) => ({ buffer: 0, byteOffset: view.offset, byteLength: view.length, target: 34962 })), ...indexViews.map((view) => ({ buffer: 0, byteOffset: positionBytes.byteLength + view.offset, byteLength: view.length, target: 34963 }))],
  accessors: nodes.flatMap((_, index) => [{ bufferView: 2 + index, componentType: 5126, count: 8, type: "VEC3", min: [-1.55, (index - 2) * 0.28 - 0.11, -0.85], max: [1.55, (index - 2) * 0.28 + 0.11, 0.85] }, { bufferView: 7 + index, componentType: 5123, count: 36, type: "SCALAR" }]),
};
const jsonBytes = Buffer.from(JSON.stringify(json));
const jsonPadded = Buffer.concat([jsonBytes, Buffer.alloc((4 - (jsonBytes.length % 4)) % 4, 0x20)]);
const binPadded = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4)]);
const header = Buffer.alloc(12); header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + jsonPadded.length + 8 + binPadded.length, 8);
const jsonHeader = Buffer.alloc(8); jsonHeader.writeUInt32LE(jsonPadded.length, 0); jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(binPadded.length, 0); binHeader.writeUInt32LE(0x004e4942, 4);
const output = path.resolve("public/models/luxury-demo.glb");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.concat([header, jsonHeader, jsonPadded, binHeader, binPadded]));
