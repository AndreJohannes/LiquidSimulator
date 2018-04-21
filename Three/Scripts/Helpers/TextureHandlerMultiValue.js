var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TextureHandlerMultiValue = (function (_super) {
    __extends(TextureHandlerMultiValue, _super);
    function TextureHandlerMultiValue(N) {
        var _this = this;
        this.N = N;
        this.size = N * N * N;
        this.dataColor = new Uint8Array(this.size * 4);
        this.SetData.x = function (i, j, k, val) {
            _this.dataColor[(i + _this.N * (_this.N - 1 - j) + _this.N * _this.N * (_this.N - 1 - k)) * 4] = val;
        };
        this.SetData.y = function (i, j, k, val) {
            _this.dataColor[(i + _this.N * (_this.N - 1 - j) + _this.N * _this.N * (_this.N - 1 - k)) * 4 + 1] = val;
        } , this.SetData.z = function (i, j, k, val) {
            _this.dataColor[(i + _this.N * (_this.N - 1 - j) + _this.N * _this.N * (_this.N - 1 - k)) * 4 + 2] = val;
        } , this.SetData.a = function (i, j, k, val) {
            _this.dataColor[(i + _this.N * (_this.N - 1 - j) + _this.N * _this.N * (_this.N - 1 - k)) * 4 + 3] = val;
        };
    }
    TextureHandlerMultiValue.prototype.GetData = function (i, j, k) {
        return [
            this.dataColor[(i + this.N * (this.N - 1 - j) + this.N * this.N * (this.N - 1 - k)) * 4], 
            this.dataColor[(i + this.N * (this.N - 1 - j) + this.N * this.N * (this.N - 1 - k)) * 4 + 1], 
            this.dataColor[(i + this.N * (this.N - 1 - j) + this.N * this.N * (this.N - 1 - k)) * 4 + 2], 
            this.dataColor[(i + this.N * (this.N - 1 - j) + this.N * this.N * (this.N - 1 - k)) * 4 + 3]
        ];
    };
    return TextureHandlerMultiValue;
})(TextureHandler);
