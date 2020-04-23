export default class CircleGL {
  private gl: WebGL2RenderingContext;

  private width: number;

  private height: number;

  private size: number;

  private rDiff: number;

  private vs: WebGLShader | null = null;

  private fs: WebGLShader | null = null;

  private program: WebGLProgram | null = null;

  private vsText = '';

  private fsText = '';

  private uniformLocations: WebGLUniformLocation[] = new Array(4);

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    size: number
  ) {
    this.gl = canvas.getContext('webgl') as WebGL2RenderingContext;
    this.width = width;
    this.height = height;
    this.size = size;
    this.rDiff = this.size / 10;
    this.vsText = `
    attribute vec3 position;

    void main(void){
	    gl_Position = vec4(position, 1.0);
    }`;

    this.fsText = `precision mediump float;
    uniform vec2 resolution;
    uniform vec2 r;
    uniform vec2 inner;
    uniform float hue;
    float PI = 3.141592653589793;

    float atan2(float y, float x){
        return x == 0.0 ? sign(y)*PI / 2.0 : atan(y, x);
    }

    vec3 hsv(float h, float s, float v){
	    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
	    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
    }


    void main(void){
	    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
	    float x = p[0];
	    float y = p[1];
        vec2 rad = r * 2.0 / resolution;
	    vec2 size = inner / resolution;
	    float len = length(p);

	    if(rad[0] < len && len < rad[1]) {
    		float bright = 1.0 - smoothstep(0.04, (rad[1] - rad[0]) / 2.0,abs((rad[1] + rad[0]) / 2.0 - len));
		    gl_FragColor = vec4(hsv((-degrees(atan2(y, x)) + 120.0) / 360.0, 1.0, 1.0), bright);
	    }
	
	    if(-size[0] < x && x < size[0] && -size[1] < y && y < size[1]) {
    		gl_FragColor = vec4(hsv(hue / 360.0, (x / size[0] + 1.0) / 2.0, (y / size[1] + 1.0) / 2.0), 1.0);
    	}
    }
    `;
    this.init();
  }

  private init(): void {
    this.initShader();
    this.createProgram();
    this.setParams();

    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
  }

  private initShader(): void {
    this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!(this.vs && this.fs)) throw new Error('createShader failed');

    this.gl.shaderSource(this.vs, this.vsText);
    this.gl.compileShader(this.vs);
    this.gl.shaderSource(this.fs, this.fsText);
    this.gl.compileShader(this.fs);

    if (!this.gl.getShaderParameter(this.vs, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(this.vs) as string);
    }
    if (!this.gl.getShaderParameter(this.fs, this.gl.COMPILE_STATUS)) {
      throw new Error(this.gl.getShaderInfoLog(this.fs) as string);
    }
  }

  private createProgram(): void {
    if (!(this.vs && this.fs)) throw new Error('shader is not initialized');

    this.program = this.gl.createProgram() as WebGLProgram;
    this.gl.attachShader(this.program, this.vs);
    this.gl.attachShader(this.program, this.fs);
    this.gl.linkProgram(this.program);

    if (this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      this.gl.useProgram(this.program);
    } else {
      throw new Error(this.gl.getProgramInfoLog(this.program) as string);
    }
  }

  private setParams(): void {
    if (!this.program) throw new Error('program is not initialized');
    // uniform
    this.uniformLocations[0] = this.gl.getUniformLocation(
      this.program,
      'resolution'
    ) as WebGLUniformLocation;
    this.uniformLocations[1] = this.gl.getUniformLocation(
      this.program,
      'r'
    ) as WebGLUniformLocation;
    this.uniformLocations[2] = this.gl.getUniformLocation(
      this.program,
      'hue'
    ) as WebGLUniformLocation;
    this.uniformLocations[3] = this.gl.getUniformLocation(
      this.program,
      'inner'
    ) as WebGLUniformLocation;
    this.gl.uniform2fv(this.uniformLocations[0], [this.width, this.height]);
    const r = this.size - this.rDiff;
    this.gl.uniform2fv(this.uniformLocations[1], [r - this.rDiff, r]);
    this.gl.uniform1f(this.uniformLocations[2], 0);
    this.gl.uniform2fv(this.uniformLocations[3], [this.size, this.size]);

    const position = [
      -1.0,
      1.0,
      0.0,
      1.0,
      1.0,
      0.0,
      -1.0,
      -1.0,
      0.0,
      1.0,
      -1.0,
      0.0,
    ];

    const index = [0, 2, 1, 1, 2, 3];
    const vPos = this.createVBO(position);
    const vInd = this.createIBO(index);
    const vAttrLocation = this.gl.getAttribLocation(this.program, 'position');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vPos);
    this.gl.enableVertexAttribArray(vAttrLocation);
    this.gl.vertexAttribPointer(vAttrLocation, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vInd);
  }

  public render(hue: number): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.uniform1f(this.uniformLocations[2], hue);
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    this.gl.flush();
  }

  private createVBO(data: number[]): WebGLBuffer {
    const vbo = this.gl.createBuffer() as WebGLBuffer;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(data),
      this.gl.STATIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

    return vbo;
  }

  private createIBO(data: number[]): WebGLBuffer {
    const ibo = this.gl.createBuffer() as WebGLBuffer;

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);

    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Int16Array(data),
      this.gl.STATIC_DRAW
    );

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);

    return ibo;
  }
}
