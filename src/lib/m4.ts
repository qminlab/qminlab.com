/** Minimal column-major 4×4 matrix (same memory layout and multiply order as three.js Matrix4). */
export class M4 {
  e = new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  clone() {
    const m = new M4();
    m.e.set(this.e);
    return m;
  }

  copy(m: M4) {
    this.e.set(m.e);
    return this;
  }

  fromArray(a: ArrayLike<number>) {
    for (let i = 0; i < 16; i++) this.e[i] = a[i];
    return this;
  }

  /** this = this × m */
  multiply(m: M4) {
    return this.mul(this, m);
  }

  /** this = a × b */
  mul(a: M4, b: M4) {
    const A = a.e, B = b.e;
    const a11 = A[0], a12 = A[4], a13 = A[8], a14 = A[12];
    const a21 = A[1], a22 = A[5], a23 = A[9], a24 = A[13];
    const a31 = A[2], a32 = A[6], a33 = A[10], a34 = A[14];
    const a41 = A[3], a42 = A[7], a43 = A[11], a44 = A[15];
    const b11 = B[0], b12 = B[4], b13 = B[8], b14 = B[12];
    const b21 = B[1], b22 = B[5], b23 = B[9], b24 = B[13];
    const b31 = B[2], b32 = B[6], b33 = B[10], b34 = B[14];
    const b41 = B[3], b42 = B[7], b43 = B[11], b44 = B[15];
    const t = this.e;
    t[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    t[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    t[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    t[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    t[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    t[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    t[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    t[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    t[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    t[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    t[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    t[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    t[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    t[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    t[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    t[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return this;
  }

  makeTranslation(x: number, y: number, z: number) {
    this.e.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
    return this;
  }

  makeScale(x: number, y: number, z: number) {
    this.e.set([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
    return this;
  }

  /** Same frustum math as three.js PerspectiveCamera.updateProjectionMatrix() with setViewOffset(). */
  makeCssPerspective(w: number, h: number, perspective: number, offX: number, offY: number, near: number, far: number) {
    const fov = 2 * Math.atan(h / 2 / perspective);
    let top = near * Math.tan(fov / 2);
    let height = 2 * top;
    let width = (w / h) * height;
    let left = -0.5 * width;
    left += (offX * width) / w;
    top -= (offY * height) / h;
    width *= 1;
    height *= 1;
    const right = left + width, bottom = top - height;
    const x = (2 * near) / (right - left), y = (2 * near) / (top - bottom);
    const a = (right + left) / (right - left), b = (top + bottom) / (top - bottom);
    const c = -(far + near) / (far - near), d = (-2 * far * near) / (far - near);
    this.e.set([x, 0, 0, 0, 0, y, 0, 0, a, b, c, -1, 0, 0, d, 0]);
    return this;
  }
}
