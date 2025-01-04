//--------------------------------------##
// Description: General structures and enums
//--------------------------------------##
// Author: Yamachi
// Team: Forge
// Website: http://forge-dev.com
//--------------------------------------##

//-Enumerations-------------------------

export enum Bool {
  _FALSE = 0,
  _TRUE = 1,
}

export enum BoolI {
  __FALSE = 0,
  __TRUE = 1,
  ___TRUE = -1,
}

export enum Flag {
  USE_ALPHA = 0x00000002,
  BLEND_ADDITIVE = 0x00000004,
  CENTER_ORIGIN = 0x00000020,
  CENTER_ORIGIN_USE_ALPHA = 0x00000022,
  CENTER_ORIGIN_BLEND_ADDITIVE = 0x00000024,
  ANCHOR = 0x00000034,
}

//-Structures---------------------------

export class Vector4 {
  row: number[] = [];

}

export class Matrix {
  col: Vector4[] = [];

}

export class Colour {
  b: number;
  g: number;
  r: number;
  a: number;

}

export interface Range {
  min: number;
  max: number;
}

export class Vector2 {
  x: number;
  y: number;

}

export class Vector3 {
  x: number;
  y: number;
  z: number;

}

export class Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;

}

export class Vertex {
  position: Vector3;
  normal: Vector3;
  uv: Vector2;

}

export class Face {
  vert1: number;
  vert2: number;
  vert3: number;

}

export class Text {
  length: number;
  text: string;

}

export class Texture {
  id: Text;
  size: number;
  data: Uint8Array;

}

export class Translation {
  keyframe_second: number;
  position: Vector3;

}

export class Rotation {
  keyframe_second: number;
  position: Quaternion;

}