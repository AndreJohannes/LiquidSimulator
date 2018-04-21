/// <reference path='../jquery.d.ts' />


class ShaderLoader {

    private fragmentShaders: JQuery = $('script[type="x-shader/x-fragment"]');
    private vertexShaders: JQuery = $('script[type="x-shader/x-vertex"]');
    private shaderCount: number;
    public shaderStorage: Object = null;
    private callback: Function;

    constructor() {
        this.shaderCount = this.fragmentShaders.length + this.vertexShaders.length;
    }

    public GetShaders(callback: Function) {

        this.callback = callback;

        if (this.shaderStorage == null) {

            this.shaderStorage = {};

            for (var f = 0; f < this.fragmentShaders.length; f++) {
                var fShader: HTMLElement = this.fragmentShaders[f];
                this.LoadShader(fShader, 'fragment');
            }

            for (var v = 0; v < this.vertexShaders.length; v++) {
                var vShader: HTMLElement = this.vertexShaders[v];
                this.LoadShader(vShader, 'vertex');
            }

        }

        return this.shaderStorage;

    }

    private LoadShader(shader: HTMLElement, type: string) {
        var $shader: JQuery = $(shader);

        $.ajax({
            url: $shader.attr('src'),
            dataType: 'text',
            complete: (jqXHR, textStatus) => this.ProcessShader(jqXHR, textStatus, $shader.attr('name'), type)
        });
    }

    private ProcessShader(jqXHR, textStatus, name: string, type: string) {

        this.shaderCount--;

        if (!this.shaderStorage[name]) {
            this.shaderStorage[name] = {
                vertex: '',
                fragment: ''
            };
        }

        this.shaderStorage[name][type] = jqXHR.responseText;
        this.CheckForComplete();
    }

    private CheckForComplete() {
        if (!this.shaderCount) {

            this.callback(this.shaderStorage);
        }
    }

}