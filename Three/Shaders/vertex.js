varying vec2 vUv;
varying vec3 viewDirection;


void main()
	{
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
	viewDirection = (modelMatrix*vec4(position,1.0)).xyz - cameraPosition;
}