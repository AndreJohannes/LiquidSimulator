var TextureHandler = (function () {
    function TextureHandler(N, M) {
        if (typeof M === "undefined") { M = 1; }
        var _this = this;
        this.SetData = new SetData();
        this.GetTexture = function () {
            return this.dataColor;
        };
        this.GetProjectionMatrix = function () {
            if(this.projectionMatrix == null) {
                this.projectionMatrix = new THREE.Matrix4(1 / this.N1, 0, 0, 0, 0, 1 / (this.N2 * this.N3), 1 / this.N3, 0, 0, 0, 0, 0, 0, 0, 0, this.N);
            }
            return this.projectionMatrix;
        };
        this.N1 = N + 1;
        this.N2 = N , this.N3 = N;
        this.M = M;
        this.size = this.N1 * this.N2 * this.N3;
        this.dataColor = new Uint8Array(this.size * 4 * M);
        this.SetData.x = function (i, j, k, val, m) {
            if (typeof m === "undefined") { m = 0; }
            if(_this.isWithinBoundary(i, j, k)) {
                _this.dataColor[4 * m + (i + _this.N1 * (_this.N2 - 1 - j) + _this.N1 * _this.N2 * (_this.N3 - 1 - k)) * 4 * M] = val;
            }
        };
        this.SetData.y = function (i, j, k, val, m) {
            if (typeof m === "undefined") { m = 0; }
            if(_this.isWithinBoundary(i, j, k)) {
                _this.dataColor[4 * m + (i + _this.N1 * (_this.N2 - 1 - j) + _this.N1 * _this.N2 * (_this.N3 - 1 - k)) * 4 * M + 1] = val;
            }
        } , this.SetData.z = function (i, j, k, val, m) {
            if (typeof m === "undefined") { m = 0; }
            if(_this.isWithinBoundary(i, j, k)) {
                _this.dataColor[4 * m + (i + _this.N1 * (_this.N2 - 1 - j) + _this.N1 * _this.N2 * (_this.N3 - 1 - k)) * 4 * M + 2] = val;
            }
        } , this.SetData.a = function (i, j, k, val, m) {
            if (typeof m === "undefined") { m = 0; }
            if(_this.isWithinBoundary(i, j, k)) {
                _this.dataColor[4 * m + (i + _this.N1 * (_this.N2 - 1 - j) + _this.N1 * _this.N2 * (_this.N3 - 1 - k)) * 4 * M + 3] = val;
            }
        };
    }
    TextureHandler.prototype.GetData = function (i, j, k, m) {
        if (typeof m === "undefined") { m = 0; }
        return [
            this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * this.M], 
            this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * this.M + 1], 
            this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * this.M + 2], 
            this.dataColor[4 * m + (i + this.N1 * (this.N2 - 1 - j) + this.N1 * this.N2 * (this.N3 - 1 - k)) * 4 * this.M + 3]
        ];
    };
    TextureHandler.prototype.isWithinBoundary = function (i, j, k) {
        return (0 <= i && i < this.N1 && 0 <= j && j < this.N2 && 0 <= k && k < this.N3);
    };
    TextureHandler.prototype.clamp = function (x, min, max) {
        return Math.min(max, Math.max(min, x));
    };
    return TextureHandler;
})();
var SetData = (function () {
    function SetData() { }
    return SetData;
})();
