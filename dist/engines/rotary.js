import * as THREE from 'three';

// Educational Wankel geometry. Epitrochoid apex path is exact; shallow curved
// rotor flanks, ports and cycle colouring are illustrative, not calibrated.
export function createModel() {
  const root = new THREE.Group(); root.name = 'Rotary engine';
  const parts = [
    {name:'Epitrochoid housing',description:'Two-lobed working surface traced by the three apex seals.',job:'Contains the three variable-volume chambers.'},
    {name:'Triangular rotor',description:'An eccentric triangular rotor with three gently curved working faces.',job:'Transfers chamber pressure into shaft torque.'},
    {name:'Eccentric shaft',description:'The shaft rotates three times for every complete rotor turn.',job:'Supports the offset rotor and delivers output torque.'},
    {name:'Apex seals',description:'Three narrow seals follow the epitrochoid wall.',job:'Separate adjacent working chambers.'},
    {name:'Working chambers',description:'Coloured regions follow the space between rotor faces and housing.',job:'Illustrate intake, compression, expansion and exhaust.'},
    {name:'Intake, exhaust and ignition',description:'Blue intake, red exhaust and a ceramic spark plug mark the gas exchange and ignition region.',job:'Supply mixture, initiate combustion and discharge gas.'},
    {name:'Side covers',description:'Removable front and rear closure plates with perimeter fasteners.',job:'Seal the sides and support the main shaft.'}
  ];
  const pickables=[]; const materials=[]; const R=2.3,e=.42; let angle=0;
  const mat=(c,m=.7,r=.28)=>{const a=new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});materials.push(a);return a;};
  const metal=mat('#aeb8c1'), dark=mat('#384451'), rotorMat=mat('#dde3e8'), red=mat('#c33732'), sealMat=mat('#28313a'), blue=mat('#3583c4');
  const mesh=(g,m,part,parent=root)=>{const o=new THREE.Mesh(g,m);o.userData.part=part;o.castShadow=true;o.receiveShadow=true;parent.add(o);pickables.push(o);return o;};
  const cyl=(radius,length,m,part,parent=root)=>{const o=mesh(new THREE.CylinderGeometry(radius,radius,length,48),m,part,parent);o.rotation.x=Math.PI/2;return o;};
  const h=t=>new THREE.Vector2(R*Math.cos(t)+e*Math.cos(3*t),R*Math.sin(t)+e*Math.sin(3*t));
  const points=Array.from({length:360},(_,i)=>h(i/360*Math.PI*2));
  const ringShape=new THREE.Shape(points.map(p=>p.clone().multiplyScalar(1.14)));ringShape.holes.push(new THREE.Path(points.slice().reverse()));
  const housing=mesh(new THREE.ExtrudeGeometry(ringShape,{depth:1.08,bevelEnabled:false,steps:1}),metal,0);housing.position.z=-.54;
  const covers=[];
  for(const side of [-1,1]){
    const g=new THREE.Group();root.add(g);g.position.z=side*.64;covers.push(g);
    const s=new THREE.Shape(points.map(p=>p.clone().multiplyScalar(1.14)));s.holes.push(new THREE.Path().absarc(0,0,.35,0,Math.PI*2,true));
    const panel=mesh(new THREE.ExtrudeGeometry(s,{depth:.11,bevelEnabled:false}),side===1?metal:dark,6,g);panel.position.z=-.055;
    for(let i=0;i<18;i++){const p=h(i/18*Math.PI*2).multiplyScalar(1.07);const b=cyl(.07,.07,dark,6,g);b.position.set(p.x,p.y,side*.1);}
  }
  const rotor=new THREE.Group();root.add(rotor);
  function flank(k,s,rad=R-.018){const a=k*Math.PI*2/3,b=(k+1)*Math.PI*2/3;const p=new THREE.Vector2(rad*Math.cos(a),rad*Math.sin(a)).lerp(new THREE.Vector2(rad*Math.cos(b),rad*Math.sin(b)),s);p.addScaledVector(new THREE.Vector2(Math.cos((a+b)/2),Math.sin((a+b)/2)),.15*Math.sin(Math.PI*s));return p;}
  const rp=[];for(let k=0;k<3;k++)for(let i=0;i<32;i++)rp.push(flank(k,i/32));
  const rs=new THREE.Shape(rp);rs.holes.push(new THREE.Path().absarc(0,0,.67,0,Math.PI*2,true));
  const rb=mesh(new THREE.ExtrudeGeometry(rs,{depth:.69,bevelEnabled:true,bevelSize:.012,bevelThickness:.015,bevelSegments:2}),rotorMat,1,rotor);rb.position.z=-.345;
  const bearing=mesh(new THREE.TorusGeometry(.63,.055,10,64),dark,1,rotor);bearing.position.z=.36;
  for(let k=0;k<3;k++){
    const a=k*Math.PI*2/3;const seal=mesh(new THREE.BoxGeometry(.045,.075,.74),sealMat,3,rotor);seal.position.set((R-.025)*Math.cos(a),(R-.025)*Math.sin(a),0);seal.rotation.z=a;
    const recess=mesh(new THREE.CapsuleGeometry(.12,.44,5,20),dark,1,rotor);recess.scale.z=.12;recess.rotation.z=a+Math.PI/3;const p=flank(k,.5).multiplyScalar(.81);recess.position.set(p.x,p.y,.36);
  }
  const shaft=cyl(.25,2.55,dark,2);shaft.position.z=.1;
  const eccentric=cyl(.56,.93,red,2);eccentric.position.z=-.05;
  const key=mesh(new THREE.BoxGeometry(.1,.1,.7),metal,2);key.position.z=1.12;
  const chamberMats=['#65aaca','#e5b253','#d65e4d'].map(c=>{const m=mat(c,.05,.55);m.transparent=true;m.opacity=.74;m.side=THREE.DoubleSide;return m;});
  const chambers=chamberMats.map(m=>{const o=mesh(new THREE.BufferGeometry(),m,4);o.position.z=-.38;return o;});
  for(const [x,y,c] of [[-2.5,-.75,blue],[-2.5,.75,red]]){const p=cyl(.2,.82,c,5);p.rotation.set(0,0,Math.PI/2);p.position.set(x,y,0);const lip=mesh(new THREE.TorusGeometry(.22,.045,8,32),dark,5);lip.rotation.y=Math.PI/2;lip.position.set(-2.89,y,0);}
  const spark=cyl(.11,.52,mat('#eeeae1',.05,.4),5);spark.rotation.set(0,0,0);spark.position.set(0,2.22,0);const nut=cyl(.15,.19,dark,5);nut.rotation.set(0,0,0);nut.position.set(0,2.05,0);
  let currentState={playing:false,power:45,cutaway:true,explode:false};
  let lastPoseKey="";
  function position(){
    const poseKey=[angle,currentState.cutaway,currentState.explode].join("|");if(poseKey===lastPoseKey)return;lastPoseKey=poseKey;
    const a=angle*Math.PI/180,t=a/3;const center=new THREE.Vector2(e*Math.cos(a),e*Math.sin(a));rotor.position.set(center.x,center.y,0);rotor.rotation.z=t;eccentric.position.x=center.x;eccentric.position.y=center.y;key.position.x=.25*Math.cos(a);key.position.y=.25*Math.sin(a);
    for(let k=0;k<3;k++){
      chambers[k].material.color.set(['#65aaca','#e5b253','#d65e4d','#977fbb'][Math.floor(((angle+k*360)%1080)/270)]);
      const path=[];for(let i=0;i<=72;i++)path.push(h(t+(k+i/72)*Math.PI*2/3));
      for(let i=32;i>=0;i--){const p=flank(k,i/32,R).rotateAround(new THREE.Vector2(),t).add(center);path.push(p);}
      chambers[k].geometry.dispose();chambers[k].geometry=new THREE.ShapeGeometry(new THREE.Shape(path));
    }
    covers[0].position.z=-.64-(currentState.explode?.85:0);covers[1].position.z=.64+(currentState.explode?1.2:0);covers[1].visible=!currentState.cutaway;covers[0].visible=true;
    root.updateMatrixWorld(true);
  }
  function update(dt=0,state=currentState){currentState={...currentState,...state};if(currentState.playing&&dt>0)angle=(angle+dt*(35+currentState.power*3.7))%1080;position();}
  function setAngle(degrees){angle=THREE.MathUtils.clamp(Number(degrees)||0,0,1080);position();}
  function getReadout(){const cycle=angle%1080;return {angle,phase:cycle<270?'Intake':cycle<540?'Compression':cycle<810?'Expansion':'Exhaust',detail:`Shaft ${angle.toFixed(0)}° · rotor ${(angle/3).toFixed(0)}°. Three chambers work simultaneously; phase labels track one face approximately.`};}
  function select(index){pickables.forEach(o=>{if(!o.userData.originalMaterial)o.userData.originalMaterial=o.material;if(o.userData.highlightMaterial){o.userData.highlightMaterial.dispose();delete o.userData.highlightMaterial;}o.material=o.userData.originalMaterial;if(o.userData.part===index){o.material=o.material.clone();o.material.emissive.set('#c94f27');o.material.emissiveIntensity=.28;o.userData.highlightMaterial=o.material;}});}
  update(0);return {root,parts,pickables,update,setAngle,getReadout,select,camera:[5,3,10],legend:[{label:"Fresh charge",color:"#65aaca"},{label:"Compression",color:"#e5b253"},{label:"Hot gas",color:"#d65e4d"},{label:"Exhaust",color:"#977fbb"}]};
}
