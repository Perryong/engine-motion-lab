import * as THREE from 'three';
export function createModel(){
 const root=new THREE.Group(),pickables=[],parts=[
 {name:'Hot and cold working chamber',description:'A gamma-layout sealed working chamber has a red hot end and blue cooled end. Heat transfer and gas pressure are illustrative.',job:'Heating and cooling the trapped gas changes its pressure.'},
 {name:'Displacer',description:'A lightweight, deliberately undersized displacer allows gas to pass around its edge; it leads the power crank by 90 degrees.',job:'Moves gas between hot and cold regions without sealing them apart.'},
 {name:'Power piston',description:'A separate sealed piston shares the working gas through the connecting passage.',job:'Pressure changes produce mechanical work.'},
 {name:'Cranks and flywheel',description:'Two rigid slider-crank linkages share a shaft with quarter-turn phase offset. The flywheel carries the mechanism through weak parts of the cycle.',job:'Coordinates displacer motion and power-piston travel.'},
 {name:'Regenerator and transfer passage',description:'A conceptual copper mesh regenerator in the external passage stores and returns heat. This educational layout does not simulate temperature, pressure or real flow losses.',job:'Transfers working gas and recovers some heat between hot and cold regions.'}];
 const steel=new THREE.MeshStandardMaterial({color:0xa8bbc7,metalness:.85,roughness:.22}),dark=new THREE.MeshStandardMaterial({color:0x203a48,metalness:.75,roughness:.35}),copper=new THREE.MeshStandardMaterial({color:0xce884a,metalness:.8,roughness:.3}),red=new THREE.MeshStandardMaterial({color:0xe64b36,metalness:.45,roughness:.3}),blue=new THREE.MeshStandardMaterial({color:0x368abf,metalness:.55,roughness:.25}),glass=new THREE.MeshStandardMaterial({color:0xbce7ef,transparent:true,opacity:.13,depthWrite:false,metalness:.1,roughness:.2});
 function mesh(g,m,p,pos){const o=new THREE.Mesh(g,m);o.position.set(...pos);o.userData.part=p;root.add(o);pickables.push(o);return o;}
 function cyl(r,h,pos,m,p,axis='y'){let o=mesh(new THREE.CylinderGeometry(r,r,h,48),m,p,pos);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;return o;}
 function box(s,pos,m,p){return mesh(new THREE.BoxGeometry(...s),m,p,pos);}
 function rod(m,p,r=.055){const o=cyl(r,1,[0,0,0],m,p);o.userData.rigid=true;return o;}
 function join(o,a,b){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);o.position.copy(A).add(B).multiplyScalar(.5);o.scale.y=A.distanceTo(B);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());}
 box([3,.25,4.8],[0,-1.65,0],dark,3);
 for(const z of [-1.2,1.05])for(const x of [-.82,.82])box([.12,2.1,.16],[x,-.48,z],dark,3);
 for(const z of [-1.9,1.7]){box([.5,.64,.3],[0,-1.26,z],dark,3);cyl(.22,.25,[0,-.98,z],copper,3,'z');}
 cyl(.10,3.95,[0,-.98,-.1],steel,3,'z');
 const hot=cyl(.65,.72,[0,1.35,-1],red,0),cold=cyl(.65,.65,[0,.665,-1],blue,0),window=cyl(.654,1.38,[0,1.01,-1],glass,0);
 const top=cyl(.69,.12,[0,1.77,-1],red,0),bottom=cyl(.69,.12,[0,.29,-1],steel,0);
 for(let i=0;i<6;i++){const fin=mesh(new THREE.TorusGeometry(.70,.05,10,64),blue,0,[0,.38+i*.09,-1]);fin.rotation.x=Math.PI/2;fin.scale.z=.35;}
 const displacer=cyl(.51,.36,[0,1,-1],copper,1),dStem=rod(steel,1,.042),dLink=rod(steel,3),dCrank=rod(copper,3,.07);
 const powerShell=cyl(.43,1.26,[0,1.16,1.05],steel,2),powerGlass=cyl(.435,1.26,[0,1.16,1.05],glass,2),powerTop=cyl(.49,.12,[0,1.85,1.05],copper,2);
 const power=cyl(.38,.16,[0,1,1.05],dark,2),pStem=rod(steel,2,.05),pLink=rod(steel,3),pCrank=rod(copper,3,.07);
 for(let i=0;i<3;i++)cyl(.386,.018,[0,1,1.05],copper,2).userData.pistonRing=i;
 const reg=cyl(.18,1.75,[.85,1.61,.025],copper.clone(),4,'z');
 for(let i=0;i<9;i++)mesh(new THREE.TorusGeometry(.205,.02,8,40),dark,4,[.85,1.61,-.67+i*.17]);
 const pipes=[];for(const z of [-1,1.05]){const pipe=rod(copper,4,.09);pipe.userData.rigid=false;join(pipe,[0,1.61,z],[.85,1.61,z]);pipes.push(pipe);}
 const gas=mesh(new THREE.SphereGeometry(.105,16,12),new THREE.MeshStandardMaterial({color:0xffce66,emissive:0xff8730,emissiveIntensity:1}),4,[.85,1.61,0]);
 const wheel=new THREE.Group();wheel.position.set(0,-.98,-2.02);root.add(wheel);
 function wm(g,m){let o=mesh(g,m,3,[0,0,0]);root.remove(o);wheel.add(o);return o;}
 wm(new THREE.TorusGeometry(.86,.085,16,64),dark);wm(new THREE.TorusGeometry(.77,.025,12,64),copper);
 for(let i=0;i<8;i++){let a=i*Math.PI/4,o=wm(new THREE.BoxGeometry(.8,.075,.085),steel);o.position.set(.42*Math.cos(a),.42*Math.sin(a),0);o.rotation.z=a;}
 const hub=wm(new THREE.CylinderGeometry(.17,.17,.22,32),copper);hub.rotation.x=Math.PI/2;
 let angle=0,state={playing:false,power:50,cutaway:true,explode:false};
 function linkage(a,z,piston,stem,link,crank){const r=.36,L=1.18,cx=r*Math.cos(a),cy=-.98+r*Math.sin(a),sy=cy+Math.sqrt(L*L-cx*cx);piston.position.y=sy+.92;join(stem,[0,sy,z],[0,sy+.92,z]);join(link,[cx,cy,z],[0,sy,z]);join(crank,[0,-.98,z],[cx,cy,z]);}
 function pose(){reg.material.transparent=state.cutaway;reg.material.opacity=state.cutaway?.16:1;reg.material.depthWrite=!state.cutaway;const a=angle*Math.PI/180;linkage(a,1.05,power,pStem,pLink,pCrank);linkage(a+Math.PI/2,-1,displacer,dStem,dLink,dCrank);wheel.rotation.z=a;for(const o of pickables)if(o.userData.pistonRing!==undefined)o.position.y=power.position.y-.045+o.userData.pistonRing*.045;
 hot.visible=cold.visible=powerShell.visible=!state.cutaway;window.visible=powerGlass.visible=displacer.visible=power.visible=state.cutaway;for(const o of pickables)if(o.userData.pistonRing!==undefined)o.visible=state.cutaway;
 top.position.y=1.77+(state.explode?.45:0);powerTop.position.y=1.85+(state.explode?.45:0);gas.position.z=.025+.78*Math.sin(a+Math.PI/2);gas.material.color.setHSL(.02+.55*(.5+.5*Math.sin(a)),.9,.6);
 }
 function highlight(index){for(const o of pickables){o.userData.selected=o.userData.part===index;if(o._selectionOutline){o.remove(o._selectionOutline);o._selectionOutline.geometry.dispose();o._selectionOutline.material.dispose();delete o._selectionOutline;}if(o.userData.selected){const line=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,25),new THREE.LineBasicMaterial({color:0x70ffe3,transparent:true,opacity:.85}));line.scale.setScalar(1.008);o.add(line);o._selectionOutline=line;}}}
 return {root,parts,pickables,update(dt,s){state={...state,...s};if(state.playing)angle=(angle+dt*(24+state.power*1.55))%360;pose();},setAngle(d){angle=((d%360)+360)%360;pose();},getReadout(){const k=Math.floor(angle/90)%4;return {angle,phase:['Gas moves toward hot end','Heated gas expands','Gas moves toward cold end','Cooled gas compresses'][k],detail:'Gamma Stirling model: 90° displacer lead, rigid linkages, illustrative thermal phases; no combustion or gas exchange.'};},select:highlight};
}
