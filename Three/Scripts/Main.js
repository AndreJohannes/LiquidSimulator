var canvas;
var domainInfo;
var fps;
$().ready(function () {
    canvas = $('#canvas');
    domainInfo = $('#domainSize');
    var N = 16;
    domainInfo.html('Domain Size: ' + N + '^3');
    var shaderLoader = new ShaderLoader();
    shaderLoader.GetShaders(function (shaderStorage) {
        var animation = new Animation(shaderStorage['basic'].vertex, shaderStorage['basic'].fragment, N);
        animation.Animate();
        animation.DisplayFramerate($('span#fps'));
    });
});
var Animation = (function () {
    function Animation(vertexShader, fragmentShader, N) {
        if (typeof N === "undefined") { N = 8; }
        this.width = 600;
        this.height = 600;
        this.Frames = 0;
        this.N = N;
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.width, this.height);
        canvas.append(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 1, 1000);
        this.camera.position.z = 200;
        this.camera.position.x = 10.1;
        this.camera.position.y = 5.1;
        this.scene.add(this.camera);
        var directionalLight = new THREE.DirectionalLight(16777215);
        directionalLight.position.set(1, 0, 0).normalize();
        var geometry = new THREE.CubeGeometry(101, 101, 101);
        this.mesh = new THREE.Mesh(geometry);
        this.scene.add(this.mesh);
        this.CreateCube(this.scene);
        this.controls = new THREE.TrackballControls(this.camera);
    }
    Animation.prototype.Animate = function () {
        var _this = this;
        requestAnimationFrame(function () {
            return _this.Animate();
        });
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
        this.Frames++;
    };
    Animation.prototype.DisplayFramerate = function (span) {
        var _this = this;
        setInterval(function () {
            span.html(_this.Frames.toString());
            _this.Frames = 0;
        }, 1000);
    };
    Animation.prototype.CreateCube = function (scene) {
        var N = this.N;
        var volumeTexture = this.getTexture(N);
        var faceTexture = THREE.ImageUtils.loadTexture("./Images/tiles2.jpg");
        faceTexture.minFilter = THREE.LinearFilter;
        faceTexture.magFilter = THREE.LinearFilter;
        faceTexture.generateMipmaps;
        var translation = new THREE.Vector3(0, 0, 50);
        var rotation = new THREE.Vector3(0, 0, 0);
        var trMatrix = new THREE.Matrix4(N, 0, 0, 0, 0, N, 0, 0, 0, 0, -N, N, 0, 0, -1, 1);
        scene.add(this.GetPlane(translation, rotation, volumeTexture, faceTexture, trMatrix, N, 4));
        translation = new THREE.Vector3(0, 0, -50);
        rotation = new THREE.Vector3(Math.PI, 0, 0);
        trMatrix = new THREE.Matrix4(N, 0, 0, 0, 0, -N, 0, N, 0, 0, N, 0, 0, 0, 1, 1);
        scene.add(this.GetPlane(translation, rotation, volumeTexture, faceTexture, trMatrix, N, 4));
        translation = new THREE.Vector3(-50, 0, 0);
        rotation = new THREE.Vector3(0, -Math.PI / 2, 0);
        trMatrix = new THREE.Matrix4(0, 0, N, 0, 0, N, 0, 0, N, 0, 0, 0, 1, 0, 0, 1);
        scene.add(this.GetPlane(translation, rotation, volumeTexture, faceTexture, trMatrix, N, 4));
        translation = new THREE.Vector3(50, 0, 0);
        rotation = new THREE.Vector3(0, Math.PI / 2, 0);
        trMatrix = new THREE.Matrix4(0, 0, -N, N, 0, N, 0, 0, -N, 0, 0, N, -1, 0, 0, 1);
        scene.add(this.GetPlane(translation, rotation, volumeTexture, faceTexture, trMatrix, N, 4));
        translation = new THREE.Vector3(0, -50, 0);
        rotation = new THREE.Vector3(Math.PI / 2, 0, 0);
        trMatrix = new THREE.Matrix4(N, 0, 0, 0, 0, 0, N, 0, 0, N, 0, 0, 0, 1, 0, 1);
        scene.add(this.GetPlane(translation, rotation, volumeTexture, faceTexture, trMatrix, N, 4));
        translation = new THREE.Vector3(0, 50, 0);
        rotation = new THREE.Vector3(-Math.PI / 2, 0, 0);
        trMatrix = new THREE.Matrix4(N, 0, 0, 0, 0, 0, -N, N, 0, -N, 0, N, 0, -1, 0, 1);
        scene.add(this.GetPlane(translation, rotation, volumeTexture, faceTexture, trMatrix, N, 4));
    };
    Animation.prototype.GetPlane = function (translation, rotation, volumeTexture, faceTexture, trMatrix, N, M) {
        var uniforms = {
            "volumeTexture": {
                type: "t",
                value: volumeTexture
            },
            "faceTexture": {
                type: "t",
                value: faceTexture
            },
            "trMatrix": {
                type: "m4",
                value: trMatrix
            },
            "inMatrix": {
                type: "m4",
                value: new THREE.Matrix4(1 / (N + 1), 0, 0, 1 / (M * (N + 1)), 0, 1 / (N * N), 1 / N, 0, 0, 0, 0, 0, M, 0, 0, N)
            },
            "lightDirection": {
                type: "v3",
                value: new THREE.Vector3(-1, 1, 1).normalize()
            }
        };
        var material = new THREE.ShaderMaterial({
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            uniforms: uniforms
        });
        var plane = new THREE.PlaneGeometry(100, 100);
        this.mesh = new THREE.Mesh(plane, material);
        this.mesh.position = translation;
        this.mesh.rotation = rotation;
        return this.mesh;
    };
    Animation.prototype.getTexture = function (N) {
        var tex = new TextureHandler(N, 4);
        var SetData = function (i, j, k, value, m) {
            if (typeof m === "undefined") { m = 0; }
            tex.SetData.x(i, j, k, value, m);
            tex.SetData.z(i, j, k - 1, value, m);
            tex.SetData.y(i, j - 1, k, value, m);
            tex.SetData.a(i, j - 1, k - 1, value, m);
        };
        for(var i = 0; i <= N; i++) {
            for(var j = 0; j <= N; j++) {
                for(var k = 0; k <= N; k++) {
                    var f = i / N - 0.02 * Math.sin(1 * Math.sqrt(j * j + k * k));
                    SetData(i, j, k, Math.min(Math.max(255 * f, 0), 255));
                    var normal = new THREE.Vector3(1 / N, -0.02 * Math.cos(1 * Math.sqrt(j * j + k * k)) * 1 * j / Math.sqrt(j * j + k * k), -0.02 * Math.cos(1 * Math.sqrt(j * j + k * k)) * 1 * k / Math.sqrt(j * j + k * k));
                    normal.normalize();
                    SetData(i, j, k, 255 * (-normal.x + 1) / 2, 1);
                    SetData(i, j, k, 255 * (-normal.y + 1) / 2, 2);
                    SetData(i, j, k, 255 * (-normal.z + 1) / 2, 3);
                }
            }
        }
        var texture = new THREE.DataTexture(tex.GetTexture(), (N + 1) * 4, N * N, THREE.RGBAFormat, undefined, undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter);
        texture.needsUpdate = true;
        return texture;
    };
    return Animation;
})();
