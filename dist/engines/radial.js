import * as THREE from 'three';

// Single-row seven-cylinder radial. Master and articulated rod positions are
// solved exactly at fixed lengths. Valve timing / firing colours are schematic.
export function createModel(){
  const root=new THREE.Group();root.name='Seven-cylinder radial';
  const parts=[
    {name:'Cylinder barrels',description:'Seven air-cooled cylinders arranged around one crankshaft.',job:'Guide radial piston motion and reject heat through cooling fins.'},
    {name:'Pistons and rings',description:'Each piston slides on its own cylinder axis; narrow rings seal the bore.',job:'Convert chamber pressure into connecting-rod force.'},
    {name:'Master connecting rod',description:'The upper cylinder connects directly to the single crankpin through the master rod.',job:'Carries its piston and provides six articulation pins.'},
    {name:'Articulated rods',description:'Six fixed-length rods pivot on pins around the master big end.',job:'Link the other pistons to the shared crankpin.'},
    {name:'Crankshaft and crankpin',description:'One eccentric crankpin rotates about the central output axis.',job:'Converts reciprocating motion to rotation.'},
    {name:'Valve gear and heads',description:'Paired inlet and exhaust valves and rocker details at each head.',job:'Illustrate four-stroke gas exchange.'},
    {name:'Crankcase covers',description:'Front and rear support covers with circular bolt patterns.',job:'Enclose and support the central mechanism.'}
  ];
  const pickables=[];const material=(c,m=.7,r=.3)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
  const silver=material('#b8c2ca'),bright=material('#e0e5e9'),dark=material('#35414c'),red=material('#bd3933'),bronze=material('#b88b51'),blue=material('#487e9b');
  const mesh=(g,m,i,parent=root)=>{const o=new THREE.Mesh(g,m);o.userData.part=i;parent.add(o);pickables.push(o);o.castShadow=true;o.receiveShadow=true;return o;};
  const cyl=(r,l,m,i,parent=root)=>mesh(new THREE.CylinderGeometry(r,r,l,36),m,i,parent);
  const disc=(r,l,m,i,parent=root)=>{const o=cyl(r,l,m,i,parent);o.rotation.x=Math.PI/2;return o;};
  const torus=(r,t,m,i,parent=root)=>mesh(new THREE.TorusGeometry(r,t,8,48),m,i,parent);
  const rod=(m,i)=>{const o=mesh(new THREE.BoxGeometry(1,.13,.13),m,i);return o;};
  const placeRod=(o,a,b)=>{o.position.copy(a).add(b).multiplyScalar(.5);const d=b.clone().sub(a);o.rotation.z=Math.atan2(d.y,d.x);o.scale.x=d.length();};
  const sleeves=[],pistons=[],valves=[],units=[];
  const crankRadius=.56,masterLength=2.1,slaveLength=1.79,pinRadius=.34;
  for(let k=0;k<7;k++){
    const a=Math.PI/2+k*2*Math.PI/7,u=new THREE.Vector2(Math.cos(a),Math.sin(a));units.push(u);
    const barrel=new THREE.Group();barrel.rotation.z=a-Math.PI/2;root.add(barrel);
    // Back semicircle and removable front semicircle retain a true open bore.
    const back=mesh(new THREE.CylinderGeometry(.43,.43,1.45,32,1,true,Math.PI/2,Math.PI),silver,0,barrel);back.position.y=2.55;
    const sleeve=mesh(new THREE.CylinderGeometry(.43,.43,1.45,32,1,true,-Math.PI/2,Math.PI),silver,0,barrel);sleeve.position.y=2.55;sleeves.push(sleeve);
    back.material=back.material.clone();back.material.side=THREE.DoubleSide;sleeve.material=sleeve.material.clone();sleeve.material.side=THREE.DoubleSide;
    for(let j=0;j<12;j++){
      // Rear half fins preserve an unobstructed section view.
      const fin=mesh(new THREE.CylinderGeometry(.51,.51,.045,32,1,true,Math.PI/2,Math.PI),dark,0,barrel);fin.position.y=1.86+j*.115;fin.material=back.material;
    }
    const head=cyl(.47,.21,silver,5,barrel);head.position.y=3.37;
    for(const side of [-1,1]){const rocker=mesh(new THREE.BoxGeometry(.25,.085,.1),side<0?blue:red,5,barrel);rocker.position.set(side*.21,3.65,.15);rocker.rotation.z=side*.23;
      const stem=cyl(.036,.37,dark,5,barrel);stem.position.set(side*.2,3.4,.1);const valve=cyl(.12,.05,side<0?blue:red,5,barrel);valve.position.set(side*.2,3.21,.1);valves.push({mesh:valve,k,side});
      const spring=torus(.07,.018,bronze,5,barrel);spring.rotation.x=Math.PI/2;spring.position.set(side*.2,3.54,.1);
      const push=cyl(.025,1.9,dark,5,barrel);push.position.set(side*.39,2.46,-.31);
    }
    const p=new THREE.Group();p.rotation.z=a-Math.PI/2;root.add(p);pistons.push(p);
    const body=cyl(.37,.39,bright,1,p);body.position.y=.035;
    for(const yy of [.12,.19,-.06]){const ring=torus(.371,.025,dark,1,p);ring.rotation.x=Math.PI/2;ring.position.y=yy;}
    const wrist=disc(.09,.85,bronze,1,p);wrist.position.z=.025;
  }
  const backcase=disc(1.35,.16,dark,6);backcase.position.z=-.64;
  const cover=new THREE.Group();root.add(cover);cover.position.z=.53;
  const cs=new THREE.Shape();cs.absarc(0,0,1.35,0,Math.PI*2);const hole=new THREE.Path();hole.absarc(0,0,.36,0,Math.PI*2,true);cs.holes.push(hole);
  mesh(new THREE.ExtrudeGeometry(cs,{depth:.12,bevelEnabled:true,bevelSize:.035,bevelThickness:.03,bevelSegments:2}),silver,6,cover);
  for(let j=0;j<14;j++){const b=disc(.065,.09,dark,6,cover);b.position.set(1.18*Math.cos(j*Math.PI/7),1.18*Math.sin(j*Math.PI/7),.16);}
  const output=disc(.23,2.15,dark,4);output.position.z=.1;const outputRing=torus(.28,.065,red,4);outputRing.position.z=1.12;
  const web=rod(dark,4);web.scale.y=2.6;web.position.z=-.35;
  const crankpin=disc(.16,.82,red,4);crankpin.position.z=-.08;
  const master=rod(red,2);master.scale.y=1.65;
  const bigEnd=torus(pinRadius,.095,red,2);bigEnd.position.z=.14;
  const slaveRods=Array.from({length:6},()=>rod(bronze,3));
  const pins=Array.from({length:6},()=>disc(.075,.24,bright,3));
  let angle=0,state={playing:false,power:45,cutaway:true,explode:false};
  function phaseFor(k){const order=[0,2,4,6,1,3,5];return ((angle-order.indexOf(k)*720/7)%720+720)%720;}
  function position(){
    const a=angle*Math.PI/180;
    const c=new THREE.Vector2(crankRadius*Math.sin(a),crankRadius*Math.cos(a));
    const p0=new THREE.Vector2(0,c.y+Math.sqrt(masterLength*masterLength-c.x*c.x));
    const tilt=Math.atan2(p0.y-c.y,p0.x-c.x)-Math.PI/2;
    crankpin.position.set(c.x,c.y,-.08);bigEnd.position.set(c.x,c.y,.14);bigEnd.rotation.z=tilt;
    placeRod(web,new THREE.Vector3(0,0,-.35),new THREE.Vector3(c.x,c.y,-.35));
    const endpoints=[];
    for(let k=0;k<7;k++){
      const u=units[k];let q=c.clone(),L=masterLength;
      if(k>0){const aa=Math.atan2(u.y,u.x)+tilt;q.add(new THREE.Vector2(pinRadius*Math.cos(aa),pinRadius*Math.sin(aa)));L=slaveLength;}
      const proj=q.dot(u),rho=proj+Math.sqrt(L*L-q.lengthSq()+proj*proj);const p=u.clone().multiplyScalar(rho);pistons[k].position.set(p.x,p.y,0);
      const A=new THREE.Vector3(q.x,q.y,.14),B=new THREE.Vector3(p.x,p.y,.14);
      if(k===0)placeRod(master,A,B);else {placeRod(slaveRods[k-1],A,B);pins[k-1].position.set(q.x,q.y,.2);}
      endpoints.push({from:[q.x,q.y],to:[p.x,p.y],length:L});
    }
    // A compact audit record also makes geometric correctness independently testable.
    root.userData.linkages=endpoints;root.userData.crankpin=[c.x,c.y];
    valves.forEach(v=>{const ph=phaseFor(v.k);const open=v.side<0?(ph>=360&&ph<540):(ph>=180&&ph<360);v.mesh.position.y=3.21-(open?.10:0);});
    sleeves.forEach(s=>s.visible=!state.cutaway);cover.visible=!state.cutaway;cover.position.z=.53+(state.explode?1.35:0);backcase.position.z=-.64-(state.explode?.95:0);
    root.updateMatrixWorld(true);
  }
  function update(dt=0,next=state){state={...state,...next};if(state.playing&&dt>0)angle=(angle+dt*(30+state.power*3))%720;position();}
  function setAngle(degrees){angle=THREE.MathUtils.clamp(Number(degrees)||0,0,720);position();}
  function getReadout(){const p=phaseFor(0);return {angle,phase:p<180?'Power':p<360?'Exhaust':p<540?'Intake':'Compression',detail:`Upper cylinder: ${p<180?'power':p<360?'exhaust':p<540?'intake':'compression'} · schematic firing order 1–3–5–7–2–4–6. One master rod and six articulated rods share one crankpin.`};}
  function select(index){pickables.forEach(o=>{if(!o.userData.originalMaterial)o.userData.originalMaterial=o.material;if(o.userData.highlightMaterial){o.userData.highlightMaterial.dispose();delete o.userData.highlightMaterial;}o.material=o.userData.originalMaterial;if(o.userData.part===index){o.material=o.material.clone();o.material.emissive.set('#de6535');o.material.emissiveIntensity=.25;o.userData.highlightMaterial=o.material;}});}
  update(0);return {root,parts,pickables,update,setAngle,getReadout,select,camera:[3,2,11],legend:[{label:"Master rod",color:"#bd3933"},{label:"Articulated rods",color:"#b88b51"}]};
}
