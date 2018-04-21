varying vec2 vUv;
varying vec3 viewDirection;
uniform sampler2D volumeTexture;
uniform sampler2D faceTexture;
uniform mat4 trMatrix;
uniform mat4 inMatrix;
uniform vec3 lightDirection;
float bias=0.5;

struct vol{
	float vertex_1;
	float vertex_2;
	float vertex_3;
	float vertex_4;
	float vertex_5;
	float vertex_6;
	float vertex_7;
	float vertex_8;
	float max;
};

struct grad{

	vec3 vertex_1;
	vec3 vertex_2;
	vec3 vertex_3;
	vec3 vertex_4;
	vec3 vertex_5;
	vec3 vertex_6;
	vec3 vertex_7;
	vec3 vertex_8;
};

struct entry{
	vec3 entryPoint;
	vec3 direction;
	vec3 voxel;
	float N;
	float side;
};

struct voxelReturn{
	vec3 gradient;
	vec3 position;
	float side;
	bool trigger;
};

vol getVolumeDecode(vec3 pos, float side){
	pos=floor(pos);
	vec2 pos2d = (inMatrix*vec4(pos,0.5)).xy;
	vol volume;
	vec4 texture_1 = texture2D(volumeTexture,pos2d.xy);
	texture_1 = (side<0.0)? 2.0*vec4(bias)-texture_1:texture_1;
	pos2d.x += inMatrix[0][3] * inMatrix[3][0];
	vec4 texture_2 = texture2D(volumeTexture,pos2d.xy);
	texture_2 = (side<0.0)? 2.0*vec4(bias)-texture_2:texture_2;
	volume.vertex_1 = texture_1.x;
	volume.vertex_2 = texture_1.y;
	volume.vertex_3 = texture_1.z;
	volume.vertex_4 = texture_1.a;
	volume.vertex_5 = texture_2.x;
	volume.vertex_6 = texture_2.y;
	volume.vertex_7 = texture_2.z;
	volume.vertex_8 = texture_2.a;
	float max_f = max(texture_1.x,max(texture_1.y,max(texture_1.z,texture_1.a)));
	float max_b = max(texture_2.x,max(texture_2.y,max(texture_2.z,texture_2.a)));
	volume.max=max(max_f,max_b);
	return volume;
}

grad getGradientDecode(vec3 pos){
	grad gradient;
    pos=floor(pos);
	vec2 pos2d = (inMatrix*vec4(pos,1.5)).xy;
	vec4 tex=texture2D(volumeTexture,pos2d.xy);
    gradient.vertex_1.x=2.0*(tex.x-0.5);
    gradient.vertex_2.x=2.0*(tex.y-0.5);
    gradient.vertex_3.x=2.0*(tex.z-0.5);
    gradient.vertex_4.x=2.0*(tex.a-0.5);
    pos2d.x += 1.0 * inMatrix[3][0];
	tex=texture2D(volumeTexture,pos2d.xy);
	gradient.vertex_1.y=2.0*(tex.x-0.5);
    gradient.vertex_2.y=2.0*(tex.y-0.5);
    gradient.vertex_3.y=2.0*(tex.z-0.5);
    gradient.vertex_4.y=2.0*(tex.a-0.5);
    pos2d.x += 1.0 * inMatrix[3][0];
	tex=texture2D(volumeTexture,pos2d.xy);
	gradient.vertex_1.z=2.0*(tex.x-0.5);
    gradient.vertex_2.z=2.0*(tex.y-0.5);
    gradient.vertex_3.z=2.0*(tex.z-0.5);
    gradient.vertex_4.z=2.0*(tex.a-0.5);
    pos2d.x += 2.0 * inMatrix[3][0];
	tex=texture2D(volumeTexture,pos2d.xy);
	gradient.vertex_5.x=2.0*(tex.x-0.5);
    gradient.vertex_6.x=2.0*(tex.y-0.5);
    gradient.vertex_7.x=2.0*(tex.z-0.5);
    gradient.vertex_8.x=2.0*(tex.a-0.5);
    pos2d.x += 1.0 * inMatrix[3][0];
	tex=texture2D(volumeTexture,pos2d.xy);
	gradient.vertex_5.y=2.0*(tex.x-0.5);
    gradient.vertex_6.y=2.0*(tex.y-0.5);
    gradient.vertex_7.y=2.0*(tex.z-0.5);
    gradient.vertex_8.y=2.0*(tex.a-0.5);
    pos2d.x += 1.0 * inMatrix[3][0];
	tex=texture2D(volumeTexture,pos2d.xy);
	gradient.vertex_5.z=2.0*(tex.x-0.5);
    gradient.vertex_6.z=2.0*(tex.y-0.5);
    gradient.vertex_7.z=2.0*(tex.z-0.5);
    gradient.vertex_8.z=2.0*(tex.a-0.5);
	return gradient;
}

float getFaceValue(vec3 relPos,vol volume,vec3 face,vec3 direction,float side){

	vec3 posFace = step(0.0,side*direction)*face;
	vec3 negFace = step(0.0,-side*direction)*face;
	// For some very wiered reason the order of the following addition is absolutely neccessary
	vec4 c =
		 posFace.x * vec4(volume.vertex_1,volume.vertex_2,volume.vertex_3,volume.vertex_4);
	c += negFace.x * vec4(volume.vertex_5,volume.vertex_6,volume.vertex_7,volume.vertex_8);
	c += posFace.y * vec4(volume.vertex_1,volume.vertex_5,volume.vertex_3,volume.vertex_7);
	c += negFace.y * vec4(volume.vertex_2,volume.vertex_6,volume.vertex_4,volume.vertex_8);
	c += posFace.z * vec4(volume.vertex_1,volume.vertex_2,volume.vertex_5,volume.vertex_6);
	c += negFace.z * vec4(volume.vertex_3,volume.vertex_4,volume.vertex_7,volume.vertex_8);

	vec2 relPos2d;
	relPos2d.x = face.x * relPos.y;
	relPos2d.x += face.y * relPos.x;
	relPos2d.x += face.z * relPos.y;
	relPos2d.y = face.x * relPos.z;
	relPos2d.y += face.y * relPos.z;
	relPos2d.y += face.z * relPos.x;

	vec4 coeff=vec4(c.x,c.y-c.x,c.z-c.x,c.x-c.y-c.z+c.a);
	float retValue = coeff.x;
	retValue += coeff.y * relPos2d.x;
	retValue += coeff.z * relPos2d.y;
	retValue += coeff.w * relPos2d.x*relPos2d.y;
	return retValue;
}

vec4 getExitTexture(vec3 pos,vec3 face){
	vec2 pos2d;
	pos2d.x += face.x * pos.y;
	pos2d.x += face.y * pos.x;
	pos2d.x += face.z * pos.y;
	pos2d.y += face.x * pos.z;
	pos2d.y += face.y * pos.z;
	pos2d.y += face.z * pos.x;
	return texture2D(faceTexture,pos2d);
}

vec3 getGradient(vec3 relPos,grad gradient){
	vec3 coeff_1 = gradient.vertex_1;
	vec3 coeff_2 = gradient.vertex_2-gradient.vertex_1;
	vec3 coeff_3 = gradient.vertex_3-gradient.vertex_1;
	vec3 coeff_4 = gradient.vertex_1-gradient.vertex_2-gradient.vertex_3+gradient.vertex_4;
	vec3 coeff_5 = gradient.vertex_5;
	vec3 coeff_6 = gradient.vertex_6-gradient.vertex_5;
	vec3 coeff_7 = gradient.vertex_7-gradient.vertex_5;
	vec3 coeff_8 = gradient.vertex_5-gradient.vertex_6-gradient.vertex_7+gradient.vertex_8;

 	vec3 retGrad = coeff_1*(1.0-relPos.x) + coeff_5*relPos.x
				+ (coeff_2*(1.0-relPos.x) + coeff_6*relPos.x) * relPos.y
				+ (coeff_3*(1.0-relPos.x) + coeff_7*relPos.x) * relPos.z
				+ (coeff_4*(1.0-relPos.x) + coeff_8*relPos.x) * relPos.y * relPos.z;

	//return retGrad;
	return normalize(retGrad);
}

vec3 getProjection(vec3 direction){
	return vec3(1.0/direction.x,1.0/direction.y,1.0/direction.z);
}

float getLighting(vec3 normal,vec3 direction){

	return  (
		  0.0
		+ 0.0 * dot(normalize(normal), normalize(lightDirection))
		+ 1.9 * dot(reflect(normalize(lightDirection),normalize(normal)), normalize(direction) )
		);

}

voxelReturn marchVoxel(float t_next,
			 vol currentVolume,
			 vec3 currentCube,
			 vec3 currentFace,
			 vec3 nextLevels,
			 vec3 entryPoint,
			 vec3 increment,
			 vec3 projection,
			 vec3 direction
			 ){
	vec3 entryRelPos = (direction*t_next+entryPoint)-currentCube;
	float entryValue =  getFaceValue(entryRelPos,currentVolume,currentFace,direction,1.0);
	vec3 t_nextLevels = projection*(nextLevels-entryPoint);
	t_next = min(t_nextLevels.x,min(t_nextLevels.y,t_nextLevels.z));
	currentFace = step(0.0,vec3(t_next,t_next,t_next)-t_nextLevels);
	vec3 exitRelPos = (direction*t_next+entryPoint)-currentCube;
	float exitValue = getFaceValue(exitRelPos , currentVolume , currentFace,direction , -1.0);
	vec3 relPos = mix(entryRelPos , exitRelPos , clamp( 0.0 , 1.0, (bias - entryValue) / (exitValue - entryValue) ));
	voxelReturn vox;
	vox.trigger = ((max(entryValue,exitValue)>=bias));// && (bias>=min(entryValue,exitValue)));
	vox.gradient = getGradient(relPos,getGradientDecode(currentCube));
	vox.position = relPos+currentCube;
	return vox;
}

void main( ) {

	float N = inMatrix[3][3];
	float side = 1.0;
	float n = 0.95;
	vec3 direction = normalize(viewDirection);
	vec3 projection = getProjection(direction);
	vec3 entryPoint = (trMatrix*vec4(vUv.x,vUv.y,0,1.0)).xyz;
	vec3 exitPlanes = step(0.0,direction)*N;
	vec3 t_exitPlanes = projection*(exitPlanes-entryPoint);
	float t_exit = min(t_exitPlanes.x,min(t_exitPlanes.y,t_exitPlanes.z));
	vec3 increment = 2.0*step(0.0,direction)-vec3(1.0,1.0,1.0);
	vec3 onset = vec3(trMatrix[0][3],trMatrix[1][3],trMatrix[2][3]);
	vec3 currentCube = floor(entryPoint-step(1.0,-onset));
	vec3 currentFace = abs(onset);
	vec3 nextLevels = currentCube+step(0.0,direction);
	float t_next = 0.0;
	vec4 color = vec4(1.0,1.0,1.0,1.0);
	float filter = 0.0;
	float transitions =0.0;

	vol currentVolume = getVolumeDecode(currentCube,side);
	if(currentVolume.max >= bias){
		float entryValue=getFaceValue(entryPoint-currentCube,currentVolume,currentFace,direction,side);
		if(entryValue>=bias){
			direction = normalize(refract(direction,-sign(direction)*currentFace,n));
			projection = getProjection(direction);
			nextLevels = currentCube+step(0.0,direction);
			exitPlanes = step(0.0,direction)*N;
			t_exitPlanes = projection*(exitPlanes-entryPoint);
			t_exit = min(t_exitPlanes.x,min(t_exitPlanes.y,t_exitPlanes.z));
			increment = 2.0*step(0.0,direction)-vec3(1.0,1.0,1.0);
			//color += step(0.0,side)*getLighting(vox.gradient);
			color=vec4(0.5,0.4,1.0,1.0);
			n=1.0/n;side =- side; transitions++;
		}
	}

	for(int i=0 ; i!=-1 ; i++){

		currentVolume = getVolumeDecode(currentCube,side);
		if(currentVolume.max >= bias){
		    voxelReturn vox = marchVoxel(t_next,currentVolume,currentCube,currentFace,nextLevels,entryPoint,increment,projection,direction);
			if(vox.trigger){
				filter = transitions==0.0 ? dot(reflect(lightDirection,vox.gradient), direction) : filter ;
				color = transitions==0.0 ? vec4(0.5,0.4,1.0,1.0): color ;
				if(dot(direction,side*vox.gradient) < 0.0 ){
					vec3 preDirection =  refract(direction,side*vox.gradient,n) ;
					if(preDirection==vec3(0.0)){
						direction = normalize(reflect(direction,side*vox.gradient));
					}else{
						direction =normalize(preDirection) ;
						n=1.0/n;side =- side,transitions++;
					}
					entryPoint = vox.position;
					projection = getProjection(direction);
					nextLevels = currentCube+step(0.0,direction);
					exitPlanes = step(0.0,direction)*N;
					t_exitPlanes = projection*(exitPlanes-entryPoint);
					t_exit = min(t_exitPlanes.x,min(t_exitPlanes.y,t_exitPlanes.z));
					increment = 2.0*step(0.0,direction)-vec3(1.0,1.0,1.0);
				}
				else{
					n=1.0/n;side =- side; transitions++;
				}
				}
			}

		vec3 t_nextLevels = projection*(nextLevels-entryPoint);
		t_next = min(t_nextLevels.x,min(t_nextLevels.y,t_nextLevels.z));
		currentFace = step(0.0,vec3(t_next,t_next,t_next)-t_nextLevels);
		vec3 inc_next = increment * currentFace;
		nextLevels += inc_next;
		currentCube += inc_next;

		if(t_next >= t_exit){
			vec3 pos = (direction*t_next+entryPoint)/N;
			color *= getExitTexture(pos,currentFace);
			break;}

	}

	gl_FragColor =  color + 0.2*filter*vec4(1.0);
}
