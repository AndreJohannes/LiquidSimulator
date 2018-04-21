var ShaderLoader = (function () {
    function ShaderLoader() {
        this.fragmentShaders = $('script[type="x-shader/x-fragment"]');
        this.vertexShaders = $('script[type="x-shader/x-vertex"]');
        this.shaderStorage = null;
        this.shaderCount = this.fragmentShaders.length + this.vertexShaders.length;
    }
    ShaderLoader.prototype.GetShaders = function (callback) {
        this.callback = callback;
        if(this.shaderStorage == null) {
            this.shaderStorage = {
            };
            for(var f = 0; f < this.fragmentShaders.length; f++) {
                var fShader = this.fragmentShaders[f];
                this.LoadShader(fShader, 'fragment');
            }
            for(var v = 0; v < this.vertexShaders.length; v++) {
                var vShader = this.vertexShaders[v];
                this.LoadShader(vShader, 'vertex');
            }
        }
        return this.shaderStorage;
    };
    ShaderLoader.prototype.LoadShader = function (shader, type) {
        var _this = this;
        var $shader = $(shader);
        $.ajax({
            url: $shader.attr('src'),
            dataType: 'text',
            complete: function (jqXHR, textStatus) {
                return _this.ProcessShader(jqXHR, textStatus, $shader.attr('name'), type);
            }
        });
    };
    ShaderLoader.prototype.ProcessShader = function (jqXHR, textStatus, name, type) {
        this.shaderCount--;
        if(!this.shaderStorage[name]) {
            this.shaderStorage[name] = {
                vertex: '',
                fragment: ''
            };
        }
        this.shaderStorage[name][type] = jqXHR.responseText;
        this.CheckForComplete();
    };
    ShaderLoader.prototype.CheckForComplete = function () {
        if(!this.shaderCount) {
            this.callback(this.shaderStorage);
        }
    };
    return ShaderLoader;
})();
