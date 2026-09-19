import * as THREE from 'three';
export function createModel(){
 const root=new THREE.Group(),pickables=[],parts=[
 {name:'Pressurant supply',description:'Conceptual inert-gas supply maintains tank pressure in a pressure-fed liquid rocket. Regulators and plumbing details are simplified; there is no turbopump.',job:'Pushes the liquids from the tanks toward the injector.'},
 {name:'Fuel tank and feed',description:'The amber route represents a generic liquid fuel. Tank proportions and fluid motion are schematic.',job:'Supplies fuel under pressure.'},
 {name:'Oxidizer tank and feed',description:'The blue route represents a separately stored liquid oxidizer. No particular propellant pair is assumed.',job:'Supplies oxidizer under pressure.'},
 {name:'Injector plate',description:'An illustrative array of separate feed holes introduces the two liquids into the chamber; mixing and atomization are simplified.',job:'Distributes propellants for combustion.'},
 {name:'Combustion chamber',description:'Schematic high-pressure combustion region. Warm particles visualize hot gas, not a reacting-flow or thermal simulation.',job:'Converts chemical energy into hot pressurized gas.'},
 {name:'Throat and bell nozzle',description:'A converging section reaches a narrow throat then expands into a bell. Gas motion accelerates qualitatively toward and through the nozzle; no performance values are implied. Wall thickness is visible in cutaway.',job:'Expands and accelerates gas to produce thrust.'},
 {name:'Exhaust plume',description:'An illustrative plume with increased particle separation and speed downstream. Its shape and brightness are artistic, not predictions of shock structure.',job:'Shows the outgoing exhaust momentum.'}
 ];
 const mat=(c,m=.6,r=.3)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,side:THREE.DoubleSide});
 const steel=mat('#9aabb7'),dark=mat('#354858'),fuel=mat('#dfa15d'),ox=mat('#56bed9'),hot=mat('#ffb755',.05),cool=mat('#7991a1');hot.emissive.set('#ff7c28');hot.emissiveIntensity=1.2;
 function mesh(g,m,p,parent=root){const o=new THREE.Mesh(g,m);o.userData.part=p;parent.add(o);pickables.push(o);return o;}
 function tube(points,r,m,p){const curve=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)));mesh(new THREE.TubeGeometry(curve,48,r,10,false),m,p);return curve;}
 function sphere(r,x,y,m,p){let o=mesh(new THREE.SphereGeometry(r,32,20),m,p);o.position.set(x,y,0);return o;}
 sphere(.34,0,3.65,cool,0);
 for(const side of [-1,1]){tube([[0,3.65,0],[side*.55,3.7,0],[side*1.48,3.45,0],[side*1.48,3.06,0]],.045,cool,0);sphere(.52,side*1.48,2.94,side<0?fuel:ox,side<0?1:2);}
 const feeds=[tube([[-1.48,2.43,0],[-1.48,1.94,0],[-.8,1.91,0],[-.44,1.70,0]],.095,fuel,1),tube([[1.48,2.43,0],[1.48,1.94,0],[.8,1.91,0],[.44,1.70,0]],.095,ox,2)];
 // Feed valves are stationary schematic shutoff bodies.
 for(const s of [-1,1]){let v=mesh(new THREE.BoxGeometry(.28,.3,.25),dark,s<0?1:2);v.position.set(s*1.48,2.13,0);let h=mesh(new THREE.TorusGeometry(.18,.028,8,24),s<0?fuel:ox,s<0?1:2);h.position.set(s*1.48,2.13,.21);}
 const injector=new THREE.Group();root.add(injector);
 const plate=mesh(new THREE.CylinderGeometry(.77,.77,.13,56),steel,3,injector);plate.position.y=1.68;
 for(let i=0;i<18;i++){const a=i*Math.PI*2/18;let j=mesh(new THREE.CylinderGeometry(.032,.032,.16,8),i%2?ox:fuel,3,injector);j.position.set(.57*Math.cos(a),1.64,.57*Math.sin(a));}
 function shell(profile,m,p){const contour=[...profile.map(v=>new THREE.Vector2(v[0],v[1])),...profile.slice().reverse().map(v=>new THREE.Vector2(Math.max(.01,v[0]-.095),v[1]))];contour.push(contour[0].clone());let group=new THREE.Group();root.add(group);let full=mesh(new THREE.LatheGeometry(contour,72),m,p,group);let cut=mesh(new THREE.LatheGeometry(contour,48,Math.PI*.53,Math.PI*1.04),m,p,group);cut.visible=false;return {group,full,cut};}
 const chamber=shell([[.77,1.60],[.79,1.35],[.79,.52],[.74,.30]],steel,4);
 const nozzle=shell([[.74,.30],[.63,.08],[.41,-.16],[.26,-.43],[.25,-.58],[.34,-.85],[.50,-1.16],[.76,-1.49],[1.09,-1.82],[1.47,-2.10]],mat('#778b9c'),5);
 for(const y of [.34,1.48]){let ring=mesh(new THREE.TorusGeometry(.79,.047,10,64),dark,4,chamber.group);ring.rotation.x=Math.PI/2;ring.position.y=y;}
 let rim=mesh(new THREE.TorusGeometry(1.43,.055,10,72),steel,5,nozzle.group);rim.rotation.x=Math.PI/2;rim.position.y=-2.10;
 const gas=[],drops=[],dotGeo=new THREE.SphereGeometry(.041,8,6);
 for(let f=0;f<2;f++)for(let i=0;i<12;i++){let o=mesh(dotGeo,f?ox:fuel,f?2:1);drops.push({o,curve:feeds[f],offset:i/12});}
 // Quadratic travel distance makes downstream speed and separation grow at a fixed emission cadence.
 for(let i=0;i<100;i++){const o=mesh(dotGeo,hot,i<74?4:6);gas.push({o,offset:i/100,az:i*2.39996,spread:.18+((i*37)%83)/110});}
 const plumeMat=new THREE.MeshBasicMaterial({color:'#ffba67',transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide});
 const plume=mesh(new THREE.ConeGeometry(.8,1.85,40,1,true),plumeMat,6);plume.position.y=-3.04;
 let cycle=0,cutaway=false,explode=false,power=55;
 function draw(){
  drops.forEach(p=>p.o.visible=!explode);gas.forEach(p=>p.o.visible=!explode);plume.visible=!explode;
  for(const x of [chamber,nozzle]){x.full.visible=!cutaway;x.cut.visible=cutaway;}
  chamber.group.position.x=explode?-.82:0;nozzle.group.position.x=explode?.82:0;injector.position.y=explode?.3:0;
  drops.forEach(p=>{const t=(cycle*1.7+p.offset)%1;p.o.position.copy(p.curve.getPointAt(t));p.o.position.z+=.105;});
  gas.forEach(p=>{const t=(cycle+p.offset)%1;const distance=.75*t+4.85*t*t;const y=1.54-distance;
   let radius=y>.3?.46:y>-.6?Math.max(.075,.12+(y+.6)*.36):Math.min(.87,.09+(-y-.6)*.32);
   p.o.position.set(Math.cos(p.az)*radius*p.spread,y,Math.sin(p.az)*radius*p.spread);p.o.scale.setScalar(y<-2.1?1.25:1);p.o.userData.part=y< -2.1?6:y<.3?5:4;
  });
 }
 function update(dt=0,state={}){cutaway=state.cutaway??cutaway;explode=state.explode??explode;power=state.power??power;if(state.playing&&dt>0)cycle=(cycle+dt*(.12+power*.003))%1;draw();}
 function setAngle(deg){cycle=(((deg%360)+360)%360)/360;draw();}
 function getReadout(){return {angle:cycle*360,phase:'Pressure-fed · steady flow',detail:'Separate liquid feeds → injector → combustion → throat → expanding exhaust. Scrub angle is a flow-animation cycle, not crank rotation. Particle speeds and spacing are qualitative.'};}
 function select(index){root.userData.selectedPart=index;for(const o of pickables){if(o._outline){o.remove(o._outline);o._outline.geometry.dispose();o._outline.material.dispose();delete o._outline;}if(o.userData.part===index){const line=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,30),new THREE.LineBasicMaterial({color:0x41c9b7,transparent:true,opacity:.8}));line.scale.setScalar(1.008);o.add(line);o._outline=line;}}}
 update(0);return {root,parts,pickables,update,setAngle,getReadout,select,camera:[7,5,9],legend:[{label:'Fuel',color:'#dfa15d'},{label:'Oxidizer',color:'#56bed9'},{label:'Hot gas',color:'#ffb755'}]};
}
