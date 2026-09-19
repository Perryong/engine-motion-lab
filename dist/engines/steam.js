import * as THREE from 'three';
export function createModel(){
 const root=new THREE.Group(),pickables=[],parts=[
 {name:'Steam cylinder and piston',description:'A simplified double-acting cylinder. The cutaway shows the piston separating admission and exhaust spaces.',job:'Steam pressure drives the piston in both directions.'},
 {name:'Crank and connecting rod',description:'A rigid connecting rod follows exact slider-crank geometry.',job:'Converts straight piston travel into rotation.'},
 {name:'Spoked flywheel',description:'A heavy rim stores rotational energy between power strokes.',job:'Smooths crankshaft rotation.'},
 {name:'Eccentric and slide valve',description:'An eccentric drives a sliding valve through a rigid rod. Port timing and colors are illustrative, not a steam-cycle simulation.',job:'Alternates admission and exhaust at each end of the cylinder.'},
 {name:'Steam supply and exhaust',description:'Red indicates fresh steam and blue indicates exhaust; pressure, condensation and expansion are simplified.',job:'Brings steam to the valve chest and removes spent steam.'}];
 const metal=new THREE.MeshStandardMaterial({color:0x9caeb7,metalness:.85,roughness:.24}),dark=new THREE.MeshStandardMaterial({color:0x263e4b,metalness:.8,roughness:.32}),copper=new THREE.MeshStandardMaterial({color:0xc08048,metalness:.75,roughness:.28}),red=new THREE.MeshStandardMaterial({color:0xff633e,emissive:0xc82d0e,emissiveIntensity:.5,transparent:true,opacity:.55}),blue=new THREE.MeshStandardMaterial({color:0x389eff,emissive:0x086ac9,emissiveIntensity:.5,transparent:true,opacity:.55});
 function mesh(g,m,p,pos){const o=new THREE.Mesh(g,m);o.position.set(...pos);o.userData.part=p;root.add(o);pickables.push(o);return o;}
 function box(s,pos,m,p){return mesh(new THREE.BoxGeometry(...s),m,p,pos);}
 function cyl(r,h,pos,m,p,axis='y'){const o=mesh(new THREE.CylinderGeometry(r,r,h,48),m,p,pos);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;}
 function rod(a,b,r,m,p){const o=cyl(r,1,[0,0,0],m,p);o.userData.rigid=true;return o;}
 function connect(o,a,b){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);o.position.copy(A).add(B).multiplyScalar(.5);o.scale.y=A.distanceTo(B);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());}
 box([5.8,.28,2.25],[-.25,-1.36,0],dark,1);
 for(const x of [-2.55,-1.2,1])box([.3,.85,1.3],[x,-.84,0],dark,1);
 const shell=cyl(.63,1.75,[-2.1,0,0],copper,0,'x');
 const sleeve=cyl(.638,1.7,[-2.1,0,0],new THREE.MeshStandardMaterial({color:0xc9edf6,metalness:.1,roughness:.22,transparent:true,opacity:.13,depthWrite:false}),0,'x');
 const caps=[cyl(.7,.13,[-3.02,0,0],metal,0,'x'),cyl(.7,.13,[-1.18,0,0],metal,0,'x')];
 for(const x of [-3.095,-1.105])for(let i=0;i<8;i++){const t=i*Math.PI/4;cyl(.045,.055,[x,.58*Math.sin(t),.58*Math.cos(t)],dark,0,'x');}
 const piston=cyl(.56,.15,[-2,0,0],metal,0,'x'),stem=cyl(.07,1,[0,0,0],metal,1,'x');
 const left=cyl(.53,.5,[-2.5,0,0],red,0,'x'),right=cyl(.53,.5,[-1.6,0,0],blue,0,'x');
 const wheel=new THREE.Group();wheel.position.set(1,0,-.48);root.add(wheel);
 function wheelMesh(g,m){let o=mesh(g,m,2,[0,0,0]);root.remove(o);wheel.add(o);return o;}
 wheelMesh(new THREE.TorusGeometry(1.22,.105,16,80),dark);wheelMesh(new THREE.TorusGeometry(1.12,.035,10,80),copper);
 for(let i=0;i<8;i++){const t=i*Math.PI/4,o=wheelMesh(new THREE.BoxGeometry(1.1,.10,.10),metal);o.position.set(.58*Math.cos(t),.58*Math.sin(t),0);o.rotation.z=t;}
 const hub=wheelMesh(new THREE.CylinderGeometry(.19,.19,.4,40),copper);hub.rotation.x=Math.PI/2;
 cyl(.12,1.6,[1,0,0],metal,2,'z');
 const crosshead=cyl(.11,.65,[-1.3,0,.25],metal,1,'z');
 const crank=rod(null,null,.075,copper,1),conrod=rod(null,null,.068,metal,1),pin=cyl(.13,.2,[0,0,.54],copper,1,'z');
 const chest=box([1.2,.36,.60],[-2.25,1.13,0],copper,3),valve=box([.35,.19,.42],[-2.2,1.13,0],metal,3);
 const eccentric=cyl(.24,.10,[1,0,-.8],copper,3,'z'),valveRod=rod(null,null,.036,metal,3),valveStem=rod(null,null,.045,metal,3);
 for(const x of [-2.77,-1.46]){cyl(.075,.6,[x,.74,0],copper,4);}
 cyl(.11,.85,[-2.25,1.73,0],red,4);cyl(.11,.7,[-1.3,1.15,0],blue,4,'x');
 let angle=0,state={playing:false,power:50,cutaway:true,explode:false};
 function pose(){const a=angle*Math.PI/180,r=.65,L=1.4,px=1+r*Math.cos(a)-Math.sqrt(L*L-r*r*Math.sin(a)**2)-1.6,cx=1+r*Math.cos(a),cy=r*Math.sin(a);piston.position.x=px;
 crosshead.position.x=px+1.6;stem.position.set(px+.8,0,0);stem.scale.y=1.6;connect(conrod,[px+1.6,0,.52],[cx,cy,.52]);connect(crank,[1,0,.52],[cx,cy,.52]);pin.position.set(cx,cy,.52);wheel.rotation.z=a;
 const ea=a+Math.PI/2,ex=1+.22*Math.cos(ea),ey=.22*Math.sin(ea),vx=ex-Math.sqrt(3.6**2-(1.13-ey)**2);eccentric.position.set(ex,ey,-.8);connect(valveRod,[ex,ey,-.8],[vx,1.13,-.8]);connect(valveStem,[vx,1.13,-.8],[vx,1.13,0]);valve.position.x=vx;
 const lo=-2.94,hi=-1.26,l=Math.max(.02,px-.08-lo),rr=Math.max(.02,hi-px-.08);left.position.x=lo+l/2;left.scale.y=l/.5;right.position.x=hi-rr/2;right.scale.y=rr/.5;const forward=Math.sin(a)<0;left.material=forward?red:blue;right.material=forward?blue:red;
 shell.visible=!state.cutaway;sleeve.visible=state.cutaway;left.visible=right.visible=piston.visible=state.cutaway;chest.material.opacity=state.cutaway?.2:1;chest.material.transparent=state.cutaway; // independent shell material below
 caps[0].position.x=-3.02-(state.explode?.38:0);caps[1].position.x=-1.18+(state.explode?.28:0);
 }
 chest.material=copper.clone();
 function highlight(index){for(const o of pickables){o.userData.selected=o.userData.part===index;if(o._selectionOutline){o.remove(o._selectionOutline);o._selectionOutline.geometry.dispose();o._selectionOutline.material.dispose();delete o._selectionOutline;}if(o.userData.selected){const line=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,25),new THREE.LineBasicMaterial({color:0x70ffe3,transparent:true,opacity:.85}));line.scale.setScalar(1.008);o.add(line);o._selectionOutline=line;}}}
 return {root,parts,pickables,update(dt,s){state={...state,...s};if(state.playing)angle=(angle+dt*(30+state.power*1.8))%360;pose();},setAngle(d){angle=((d%360)+360)%360;pose();},getReadout(){return {angle,phase:Math.sin(angle*Math.PI/180)<0?'Admission at left · exhaust at right':'Admission at right · exhaust at left',detail:'Illustrative double-acting steam engine; exact rigid-rod kinematics, simplified valve timing and steam colors.'};},select:highlight,};
}
