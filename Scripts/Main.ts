/// <reference path='jquery.d.ts' />
/// <reference path='three.d.ts' />
/// <reference path='Helpers/ShaderLoader.ts' />
/// <reference path='Helpers/TextureHandler.ts' />

var canvas: JQuery;
var domainInfo: JQuery;
var fps: JQuery;

$().ready(function () {
    canvas = $('#canvas');
    domainInfo = $('#domainSize');
    var N: number = 16;
    domainInfo.html('Domain Size: ' + N + '^3');
    var shaderLoader = new ShaderLoader();
    shaderLoader.GetShaders(function (shaderStorage) {
        var animation: Animation = new Animation(shaderStorage['basic'].vertex, shaderStorage['basic'].fragment, N);
        animation.Animate();
        animation.DisplayFramerate($('span#fps'));
    });
});

class Animation {
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private mesh: THREE.Mesh;
    private controls;
    private vertexShader: string;
    private fragmentShader: string;

    private width = 600;
    private height = 600;
    private N;
    private Frames: number = 0;

    constructor(vertexShader: string, fragmentShader: string, N = 8) {
        this.N = N;
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
        //create scene, basic Object for cameras, lights, and meshes
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.width, this.height);
        canvas.append(this.renderer.domElement);

        // add camera to scene
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 1, 1000);
        this.camera.position.z = 200;
        this.camera.position.x = 10.1;
        this.camera.position.y = 5.1;
        this.scene.add(this.camera);

        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(1, 0, 0).normalize();
        //scene.add(directionalLight);

        //add Cube
        var geometry = new THREE.CubeGeometry(101, 101, 101);
        this.mesh = new THREE.Mesh(geometry);
        this.scene.add(this.mesh);

        this.CreateCube(this.scene);

        this.controls = new THREE.TrackballControls(this.camera);
    }

    public Animate() {

        requestAnimationFrame(() => this.Animate());
        //render scene - redraw scene
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
        this.Frames++;
    }

    public DisplayFramerate(span: JQuery) {
        setInterval(() => {
            span.html(this.Frames.toString());
            this.Frames = 0;
        }, 1000);

    }

    private CreateCube(scene) {
        var N: number = this.N;

        var volumeTexture = this.getTexture(N);
        var faceTexture = THREE.ImageUtils.loadTexture("./Images/tiles2.jpg");
        faceTexture.minFilter = THREE.LinearFilter;
        faceTexture.magFilter = THREE.LinearFilter;
        faceTexture.generateMipmaps;

        var translation = new THREE.Vector3(0, 0, 50);
        var rotation = new THREE.Vector3(0, 0, 0);
        var trMatrix = new THREE.Matrix4(N, 0, 0, 0, 0, N, 0, 0, 0, 0, -N, N, 0, 0, -1, 1);
        scene.add(this.GetPlane(translation, rotation, volumeTexture,faceTexture, trMatrix, N, 4));

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

    }

    private GetPlane(translation, rotation, volumeTexture,faceTexture, trMatrix, N, M) {

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
    }

    private getTexture(N) {
        var tex = new TextureHandler(N, 4);
        var SetData: Function = function (i: number, j: number, k: number, value: number, m = 0) {
            tex.SetData.x(i, j, k, value, m);
            tex.SetData.z(i, j, k - 1, value, m);
            tex.SetData.y(i, j - 1, k, value, m);
            tex.SetData.a(i, j - 1, k - 1, value, m);
        }
/*
       for (var i = 0; i <= N; i++) {
             for (var j = 0; j <= N; j++) {
                 for (var k = 0; k <= N; k++) {
                     var normal: THREE.Vector3 = new THREE.Vector3(i - N / 2, j - N / 2, k - N / 2);
                     SetData(i, j, k, Math.min(Math.max(255 * (1 - 2.4 * normal.length() / N), 0), 255));
                     normal.normalize();
                     SetData(i, j, k, 255 * (normal.x + 1) / 2, 1);
                     SetData(i, j, k, 255 * (normal.y + 1) / 2, 2);
                     SetData(i, j, k, 255 * (normal.z + 1) / 2, 3);
                 }
             }
        }
*/
       for (var i = 0; i <= N; i++) {
           for (var j = 0; j <= N; j++) {
               for (var k = 0; k <= N; k++) {
                   var f: number = i / N - 0.02*Math.sin(1*Math.sqrt(j*j+k*k));
                   SetData(i, j, k, Math.min(Math.max(255 * f, 0), 255));
                   var normal: THREE.Vector3 = new THREE.Vector3(1 / N,
                      -0.02* Math.cos(1*Math.sqrt(j * j + k * k)) * 1*j / Math.sqrt(j * j + k * k),
                      -0.02* Math.cos(1*Math.sqrt(j * j + k * k)) * 1*k / Math.sqrt(j * j + k * k));
                   normal.normalize();
                   SetData(i, j, k, 255 * (-normal.x + 1) / 2, 1);
                   SetData(i, j, k, 255 * (-normal.y + 1) / 2, 2);
                   SetData(i, j, k, 255 * (-normal.z + 1) / 2, 3);
               }
           }
       }
    
      /*  for (var i = 0; i <= N; i++) {
            for (var j = 0; j <= N; j++) {
                var x: number = Math.sin(Math.sqrt(j * j + i * i)) + N/2;
                var frac: number = x % 1;
                if (frac < 0.5) {
                    SetData(i, Math.floor(x), j, 255 * (0.5 / (1 - frac)));
                    SetData(i, Math.floor(x) + 1, j, 0);
                }
                else {
                    SetData(i, Math.floor(x), j, 255);
                    SetData(i, Math.floor(x) + 1, j, 255 * ((frac - 0.5) / frac));
                }
                for (var k = 0; k < Math.floor(x); k++) {
                    SetData(i, k, j, 255);
                }
   
                var normal: THREE.Vector3 = new THREE.Vector3(
                    -Math.cos(Math.sqrt(j * j + i * i)) * i / Math.sqrt(j * j + i * i),
                    1,
                    -Math.cos(Math.sqrt(j * j + i * i)) * j / Math.sqrt(j * j + i * i));
                normal.normalize;
   
                var light: THREE.Vector3 = new THREE.Vector3(1, 1, 0);
                light.normalize;
   
                var color: number = 0.2 + 0.2 * light.dot(normal);
               
                for (var k = 0; k <= N; k++) {
   
                    SetData(i, k, j, 255*color, 1);
   
                }
            }
        }*/



        var texture = new THREE.DataTexture(tex.GetTexture(), (N + 1) * 4, N * N, THREE.RGBAFormat, undefined, undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter);
        texture.needsUpdate = true;
        return texture;
    }

}

