/// <reference path='../three.d.ts' />

class TextureHandler {

    private N1; N2; N3: number;
    private M: number;
    private size: number;
    private dataColor: Uint8Array;
    private projectionMatrix: THREE.Matrix4;
    public SetData: SetData = new SetData();

    constructor(N, M = 1) {
        this.N1 = N + 1; this.N2 = N, this.N3 = N;
        this.M = M;
        this.size = this.N1 * this.N2 * this.N3;
        this.dataColor = new Uint8Array(this.size * 4 * M);

        this.SetData.x = (i, j, k, val, m = 0) => {
            if (this.isWithinBoundary(i, j, k))
                this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * M] = val;
        };

        this.SetData.y = (i, j, k, val, m = 0) => {
            if (this.isWithinBoundary(i, j, k))
                this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * M + 1] = val;
        },
        this.SetData.z = (i, j, k, val, m = 0) => {
            if (this.isWithinBoundary(i, j, k))
                this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * M + 2] = val;
        },
       this.SetData.a = (i, j, k, val, m = 0) => {
           if (this.isWithinBoundary(i, j, k))
               this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * M + 3] = val;
       }



    }
    public GetData(i, j, k, m = 0) {
        return [this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * this.M],
            this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * this.M + 1],
            this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * this.M + 2],
             this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * this.M + 3]]
    };


    public GetTexture = function () {
        return this.dataColor;
    };

    public GetProjectionMatrix = function () {
        if (this.projectionMatrix == null) {
            this.projectionMatrix = new THREE.Matrix4(1 / this.N1, 0, 0, 0,
                                         0, 1 / (this.N2 * this.N3), 1 / this.N3, 0,
                                         0, 0, 0, 0,
                                         0, 0, 0, this.N);
        }
        return this.projectionMatrix;
    };

    private isWithinBoundary(i: number, j: number, k: number) {
        return (0 <= i && i < this.N1 && 0 <= j && j < this.N2 && 0 <= k && k < this.N3);
    }

    private clamp(x, min, max) {

        return Math.min(max, Math.max(min, x));

    }

}

class SetData {
    x: Function;
    y: Function;
    z: Function;
    a: Function;
}