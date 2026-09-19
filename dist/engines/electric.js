import * as THREE from 'three';
export function createModel(){
 const root=new THREE.Group(), rotor=new THREE.Group(), housing=new THREE.Group(), parts=[
 {name:'Three-phase stator',description:'Six illustrative concentrated coils form three phase axes. Opposite coils have opposite winding polarity; the ideal sinusoidal currents create a rotating two-pole field.',job:'Creates the rotating magnetic field.'},
 {name:'Permanent-magnet rotor',description:'One north pole and one south pole: one pole pair. Mechanical and electrical angles are equal in this synchronous teaching model.',job:'Follows the rotating field and turns the shaft.'},
 {name:'Drive shaft',description:'The central steel shaft rotates with the permanent magnets.',job:'Delivers mechanical rotation.'},
 {name:'Bearings and end supports',description:'Two stationary bearing supports constrain the shaft. The illustrated open supports expose the rotor.',job:'Supports low-friction shaft rotation.'},
 {name:'Motor housing',description:'A finned protective enclosure surrounds the laminated stator core. Cutaway hides this cover.',job:'Protects and cools the motor.'},
 {name:'Rotating magnetic field',description:'The gold arrow is the ideal resultant field. Coil brightness indicates current magnitude. The field leads the rotor north axis by 20 electrical degrees, an illustrative fixed load angle, not a torque calculation.',job:'Shows the relationship between three-phase excitation and rotor position.'}
 ];
 const pickables=[],coils=[], phaseArrows=[], movers=[],mat=(c,m=.6,r=.3)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
 const steel=mat('#a4b7c9'),dark=mat('#283845'),copper=mat('#c8793c'),gold=mat('#ffc75c',.45),red=mat('#e56858'),blue=mat('#55b9db');
 function mesh(g,m,p,parent=root){const o=new THREE.Mesh(g,m);o.userData.part=p;parent.add(o);pickables.push(o);return o;}
 function cyl(r,h,m,p,parent=root){let o=mesh(new THREE.CylinderGeometry(r,r,h,56),m,p,parent);o.rotation.x=Math.PI/2;return o;}
 function ring(r,t,z,m,p,parent=root){let o=mesh(new THREE.TorusGeometry(r,t,12,64),m,p,parent);o.position.z=z;return o;}
 root.add(rotor,housing);
 // Stator back iron and six radial laminated teeth remain visible with the cover removed.
 ring(2.02,.16,-.68,dark,0);ring(2.02,.16,.68,dark,0);
 const phaseColors=['#de934f','#56b6ca','#a18edb'];
 for(let k=0;k<6;k++){
  const a=k*Math.PI/3,rad=new THREE.Vector3(Math.cos(a),Math.sin(a),0);
  const tooth=mesh(new THREE.BoxGeometry(.57,.45,1.35),steel,0);tooth.position.copy(rad.clone().multiplyScalar(1.65));tooth.rotation.z=a;
  const arrow=new THREE.Group();root.add(arrow);arrow.position.set(rad.x*2.57,rad.y*2.57,.86);const stem=mesh(new THREE.CylinderGeometry(.024,.024,.34,8),gold,5,arrow);stem.rotation.z=-Math.PI/2;stem.position.x=.17;const tip=mesh(new THREE.ConeGeometry(.075,.16,10),gold,5,arrow);tip.rotation.z=-Math.PI/2;tip.position.x=.41;phaseArrows.push({arrow,a});
  const cm=copper.clone();cm.color.set(phaseColors[[0,2,1,0,2,1][k]]);cm.emissive.set(phaseColors[[0,2,1,0,2,1][k]]);
  for(let j=0;j<7;j++){const c=mesh(new THREE.TorusGeometry(.32,.048,8,24),cm,0);c.scale.y=1.8;c.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),rad);c.position.copy(rad.clone().multiplyScalar(1.43+j*.073));coils.push({mesh:c,a,material:cm});}
 }
 cyl(1.08,1.18,dark,1,rotor);
 for(let i=0;i<2;i++){const mag=mesh(new THREE.CylinderGeometry(1.17,1.17,1.13,36,1,false,i*Math.PI+.09,Math.PI-.18),i===0?red:blue,1,rotor);mag.rotation.x=Math.PI/2;}
 // A small north-axis marker makes the mechanical phase unambiguous.
 const north=mesh(new THREE.SphereGeometry(.095,14,10),red,1,rotor);north.position.set(1.22,0,.64);
 cyl(.24,4.7,steel,2,rotor);const key=mesh(new THREE.BoxGeometry(.16,.14,.65),gold,2,rotor);key.position.set(.2,0,1.93);
 for(const z of [-1.12,1.12]){const support=new THREE.Group();root.add(support);support.position.z=z;movers.push({o:support,z});ring(.48,.15,0,steel,3,support);ring(.28,.055,0,dark,3,support);for(let j=0;j<3;j++){let a=j*Math.PI*2/3;let s=mesh(new THREE.BoxGeometry(1.53,.12,.17),dark,3,support);s.position.set(Math.cos(a)*1.12,Math.sin(a)*1.12,0);s.rotation.z=a;}ring(1.96,.10,0,steel,3,support);}
 const cover=mesh(new THREE.CylinderGeometry(2.28,2.28,1.88,64,1,true),mat('#476477'),4,housing);cover.rotation.x=Math.PI/2;
 for(let z=-.84;z<.9;z+=.21)ring(2.29,.055,z,dark,4,housing);
 const field=new THREE.Group();root.add(field);field.position.z=1.46;
 const line=mesh(new THREE.CylinderGeometry(.033,.033,2.74,12),gold,5,field);line.rotation.z=-Math.PI/2;line.position.x=.15;
 const head=mesh(new THREE.ConeGeometry(.14,.35,16),gold,5,field);head.rotation.z=-Math.PI/2;head.position.x=1.65;
 ring(1.72,.012,1.46,mat('#927848',.2),5);
 let angle=0,power=55,cutaway=false,explode=false;
 function draw(){rotor.rotation.z=angle;const electrical=angle+THREE.MathUtils.degToRad(20);field.rotation.z=electrical;coils.forEach(c=>{const current=Math.cos(electrical-c.a);c.material.emissiveIntensity=.06+.55*Math.abs(current);});phaseArrows.forEach(({arrow,a})=>{const current=Math.cos(electrical-a);arrow.rotation.z=a+(current<0?Math.PI:0);arrow.scale.set(.25+.75*Math.abs(current),1,1);});housing.visible=!cutaway;housing.position.z=explode?-1.25:0;movers.forEach(x=>x.o.position.z=x.z+(explode?Math.sign(x.z)*.52:0));}
 function update(dt=0,state={}){power=state.power??power;cutaway=state.cutaway??cutaway;explode=state.explode??explode;if(state.playing&&dt>0)angle=(angle+dt*(.25+power/100*2.5))%(2*Math.PI);draw();}
 function setAngle(deg){angle=THREE.MathUtils.degToRad(((deg%360)+360)%360);draw();}
 function getReadout(){const a=THREE.MathUtils.radToDeg(angle),e=(a+20)%360;return {angle:a,phase:'Synchronous · 1 pole pair',detail:`Rotor electrical angle ${a.toFixed(0)}° · field ${e.toFixed(0)}° · illustrative 20° load angle. A ${Math.cos(angle+Math.PI/9).toFixed(2)}, B ${Math.cos(angle+Math.PI/9-2*Math.PI/3).toFixed(2)}, C ${Math.cos(angle+Math.PI/9-4*Math.PI/3).toFixed(2)} (normalized).`};}
 function select(index){root.userData.selectedPart=index;for(const o of pickables){if(o._outline){o.remove(o._outline);o._outline.geometry.dispose();o._outline.material.dispose();delete o._outline;}if(o.userData.part===index){const line=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,30),new THREE.LineBasicMaterial({color:0x41c9b7,transparent:true,opacity:.8}));line.scale.setScalar(1.008);o.add(line);o._outline=line;}}}
 update(0);return {root,parts,pickables,update,setAngle,getReadout,select,camera:[7,5,9],legend:[{label:'Phase A',color:'#de934f'},{label:'Phase B',color:'#56b6ca'},{label:'Phase C',color:'#a18edb'},{label:'North pole',color:'#e56858'},{label:'South pole',color:'#55b9db'}]};
}
