import * as THREE from 'three';
const TAU=Math.PI*2;
const metal=(color,roughness=.3,metalness=.75)=>new THREE.MeshStandardMaterial({color,roughness,metalness,side:THREE.DoubleSide});
export const componentData=[
 {name:'Fan & intake',short:'Fan & intake',category:'LOW-PRESSURE SPOOL',description:'The large front fan draws air into the engine. The flow then divides: some enters the core, while the rest travels through the surrounding bypass duct.',job:'Move a large mass of air.',energy:'The low-pressure turbine supplies power to the fan through the inner shaft.'},
 {name:'Booster',short:'LP compressor',category:'LOW-PRESSURE SPOOL',description:'The booster is the first compressor section in the core. Rotating blades add energy to the air; stationary vanes guide it into the next row.',job:'Begin compressing the core flow.',energy:'It turns with the fan and the low-pressure turbine on the same shaft.'},
 {name:'Core compressor',short:'HP compressor',category:'HIGH-PRESSURE SPOOL',description:'Successive rotor and stator rows compress the air further before it reaches the combustor. The annular passage becomes smaller as the air becomes denser.',job:'Raise the core air pressure.',energy:'A separate concentric shaft links this compressor to the high-pressure turbine.'},
 {name:'Combustor',short:'Combustor',category:'STATIONARY / HEAT ADDITION',description:'Fuel mixes with compressed air and burns continuously inside an annular chamber. Additional air helps cool the liner and shape the temperature entering the turbine.',job:'Add heat to the compressed flow.',energy:'Chemical energy becomes thermal energy. The combustor has no rotating spool.'},
 {name:'HP turbine',short:'HP turbine',category:'HIGH-PRESSURE SPOOL',description:'Hot gas expands through the first turbine stages. Stationary nozzle vanes direct it onto rotor blades, which extract energy from the flow.',job:'Power the core compressor.',energy:'The high-pressure turbine and high-pressure compressor turn together on the outer shaft.'},
 {name:'LP turbine',short:'LP turbine',category:'LOW-PRESSURE SPOOL',description:'The gas continues expanding through a larger downstream turbine. Its multiple blade rows extract the power needed by the fan and booster.',job:'Power the fan and booster.',energy:'The inner shaft passes through the high-pressure shaft to connect the rear turbine to the front fan.'},
 {name:'Exhaust nozzle',short:'Exhaust',category:'STATIONARY / FLOW EXIT',description:'The remaining core flow accelerates through the nozzle. Bypass air leaves through its own surrounding outlet; both streams contribute to thrust.',job:'Direct the flow out of the engine.',energy:'The turbines have extracted shaft work, but the outgoing air still carries momentum.'}
];
export function buildEngine(){
 const root=new THREE.Group(),sections=[],rotors=[],stators=[],pickables=[],casings=[],halves=[],combustion=[];
 const mats={silver:metal(0xa5b4c1,.24),blade:metal(0x7f919f,.27),dark:metal(0x2b3945,.36),black:metal(0x17232e,.4),case:metal(0x8093a4,.37),rim:metal(0xc1cbd3,.22),warm:metal(0x8c755e,.36),hot:metal(0x5f655f,.37),blue:metal(0x2c86ab,.27),gold:metal(0xba8239,.3)};
 const sphere=new THREE.SphereGeometry(1,14,10),unitCylinder=new THREE.CylinderGeometry(1,1,1,48);
 function add(geo,mat,parent,pos=[0,0,0]){let m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=!mat.transparent;m.receiveShadow=true;parent.add(m);return m;}
 function tube(rad,len,mat,parent,x=0){let m=add(unitCylinder,mat,parent,[x,0,0]);m.rotation.z=-Math.PI/2;m.scale.set(rad,len,rad);return m;}
 function lathe(profile,mat,parent,cut=false){const pts=profile.map(([x,r])=>new THREE.Vector2(r,x));const geo=new THREE.LatheGeometry(pts,cut?48:80,cut?0:0,cut?Math.PI:TAU);let m=add(geo,mat,parent);m.rotation.z=-Math.PI/2;return m;}
 function torus(rad,thick,mat,parent,x=0){let m=add(new THREE.TorusGeometry(rad,thick,10,72),mat,parent,[x,0,0]);m.rotation.y=Math.PI/2;return m;}
 function shell(profile,parent,id){const full=lathe(profile,mats.case,parent),half=lathe(profile,mats.case,parent,true);full.visible=false;casings.push(full);halves.push(half);full.userData.part=id;half.userData.part=id;pickables.push(full,half);return {full,half};}
 function tag(m,id){m.userData.part=id;pickables.push(m);return m;}
 function section(id,x){let g=new THREE.Group();g.position.x=x;g.userData.id=id;root.add(g);sections.push({group:g,x,offset:(id-3)*.88,id});return g;}
 function bladeGeometry(hub,tip,chord,sweep=.07,pitch=.6){const positions=[],indices=[];const nr=8,nc=6;for(let side=0;side<2;side++)for(let j=0;j<=nr;j++){const t=j/nr,r=hub+(tip-hub)*t;for(let k=0;k<=nc;k++){const u=k/nc,c=chord*(.66+.34*Math.sin(t*Math.PI*.8));const q=(u-.5)*c;const twist=pitch*(1-.4*t);const thick=Math.sin(u*Math.PI)*.035*(side===0?1:-1);positions.push(q*Math.sin(twist)+sweep*t*t+thick,r,q*Math.cos(twist)+.12*t*t);}}
 const span=(nr+1)*(nc+1);for(let side=0;side<2;side++)for(let j=0;j<nr;j++)for(let k=0;k<nc;k++){const a=side*span+j*(nc+1)+k,b=a+nc+1;side===0?indices.push(a,b,a+1,b,b+1,a+1):indices.push(a,a+1,b,b,a+1,b+1);}for(let j=0;j<nr;j++)for(const k of [0,nc]){const a=j*(nc+1)+k,b=a+nc+1;indices.push(a,b,a+span,b,b+span,a+span);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return geo;}
 function bladeRow(parent,id,x,hub,tip,count,spool,mat,chord=.22){let g=new THREE.Group();g.position.x=x;parent.add(g);const geo=bladeGeometry(hub,tip,chord,id===0?.17:.02,spool?.72:-.58);let blades=new THREE.InstancedMesh(geo,mat,count);blades.castShadow=true;blades.receiveShadow=true;let matrix=new THREE.Matrix4();for(let n=0;n<count;n++){matrix.makeRotationX(n*TAU/count);blades.setMatrixAt(n,matrix);}g.add(blades);tag(blades,id);tag(tube(hub,.14,mats.dark,g),id);if(spool)rotors.push({group:g,spool});else stators.push(g);return g;}
 const fan=section(0,-3.48);const fanRotor=bladeRow(fan,0,0,.48,1.87,28,'lp',mats.blade,.47);
 tag(lathe([[-.82,0],[-.69,.12],[-.45,.33],[-.17,.48],[.17,.49]],mats.dark,fanRotor),0);torus(.46,.027,mats.rim,fanRotor,-.16);for(let i=0;i<8;i++){let a=i*TAU/8;let m=add(sphere,mats.rim,fanRotor,[-.14,.39*Math.cos(a),.39*Math.sin(a)]);m.scale.setScalar(.035);}
 shell([[-.82,1.91],[-.74,2.01],[-.55,2.06],[.25,2.05],[.62,2.0],[.62,1.91],[.2,1.94],[-.6,1.91],[-.82,1.91]],fan,0);
 const booster=section(1,-2.45);for(let j=0;j<3;j++){const x=j*.28;bladeRow(booster,1,x,.38+j*.06,1.05-j*.06,30,'lp',mats.blade,.22);bladeRow(booster,1,x+.145,.4+j*.06,1.04-j*.06,30,null,mats.silver,.15);}
 shell([[-.28,1.16],[.9,.98],[.9,.9],[-.28,1.08],[-.28,1.16]],booster,1);
 shell([[-.28,1.99],[.85,1.88],[.85,1.81],[-.28,1.91],[-.28,1.99]],booster,1);
 const compressor=section(2,-1.38);for(let j=0;j<6;j++){const x=j*.235;bladeRow(compressor,2,x,.45+j*.034,.91-j*.025,36,'hp',mats.silver,.18);bladeRow(compressor,2,x+.125,.45+j*.034,.9-j*.025,36,null,mats.blade,.13);}
 shell([[-.13,.98],[1.45,.84],[1.45,.78],[-.13,.92],[-.13,.98]],compressor,2);shell([[-.13,1.86],[1.43,1.69],[1.43,1.63],[-.13,1.8],[-.13,1.86]],compressor,2);
 const burner=section(3,.27);shell([[-.13,.88],[.16,1.04],[1.05,1.05],[1.24,.95],[1.24,.86],[.98,.95],[.16,.94],[-.13,.78],[-.13,.88]],burner,3);tag(lathe([[-.1,.63],[.2,.63],[1.06,.65],[1.2,.68]],mats.warm,burner),3);
 shell([[-.13,1.69],[1.22,1.57],[1.22,1.51],[-.13,1.63],[-.13,1.69]],burner,3);
 for(let j=0;j<18;j++){const a=j*TAU/18,y=.8*Math.cos(a),z=.8*Math.sin(a);const injector=tag(tube(.052,.23,mats.gold,burner,-.035),3);injector.position.y=y;injector.position.z=z;const mat=new THREE.MeshBasicMaterial({color:0xff8b32,transparent:true,opacity:.65,depthWrite:false});const flame=add(sphere,mat,burner,[.37,y,z]);flame.scale.set(.32,.072,.072);combustion.push(flame);for(let n=0;n<4;n++){const hole=add(sphere,mats.black,burner,[.15+n*.21,.647*Math.cos(a),.647*Math.sin(a)]);hole.scale.set(.032,.017,.017);}}
 const hpt=section(4,1.72);for(let j=0;j<2;j++){bladeRow(hpt,4,j*.25,.53,.9,40,null,mats.warm,.16);bladeRow(hpt,4,j*.25+.135,.53,.92,40,'hp',mats.hot,.2);}shell([[-.1,.98],[.62,1.01],[.62,.95],[-.1,.92],[-.1,.98]],hpt,4);
 const lpt=section(5,2.48);for(let j=0;j<4;j++){const x=j*.28;bladeRow(lpt,5,x,.51-j*.033,1.01+j*.045,38,null,mats.warm,.14);bladeRow(lpt,5,x+.14,.51-j*.033,1.02+j*.045,38,'lp',mats.blade,.21);}shell([[-.15,1.11],[1.18,1.32],[1.18,1.25],[-.15,1.04],[-.15,1.11]],lpt,5);
 const nozzle=section(6,3.87);tag(lathe([[-.25,.42],[.22,.32],[1.07,.02]],mats.dark,nozzle),6);shell([[-.21,1.33],[.08,1.2],[.93,.91],[.95,.86],[.08,1.14],[-.21,1.27],[-.21,1.33]],nozzle,6);
 const shaftLP=tube(.105,7.38,mats.blue,root,.1),shaftHP=tube(.158,3.78,mats.gold,root,.27);
 // Sparse supports and fasteners retain a readable open section.
 for(let i=0;i<sections.length;i++){const {group:g,id}=sections[i];for(let k=0;k<8;k++){const a=k*TAU/8;if(Math.cos(a)>.1)continue;const rr=id<2?1.94:id<4?1.68:id===4?.98:1.2;const bolt=add(sphere,mats.rim,g,[.1,rr*Math.cos(a),rr*Math.sin(a)]);bolt.scale.set(.045,.035,.035);}}
 const particleCount=460,positions=new Float32Array(particleCount*3),colors=new Float32Array(particleCount*3),seeds=[];const cBlue=new THREE.Color('#248eae'),cCool=new THREE.Color('#d2a34f'),cHot=new THREE.Color('#df6a29');
 for(let i=0;i<particleCount;i++)seeds.push({t:(i*.61803398875)%1,a:(i*.754877666)*TAU,bypass:i<300,layer:.15+.8*((i*.381966)%1)});
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(positions,3));pg.setAttribute('color',new THREE.BufferAttribute(colors,3));const particles=new THREE.Points(pg,new THREE.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:.83,depthWrite:false,sizeAttenuation:true}));particles.frustumCulled=false;root.add(particles);
 const flowLines=new THREE.Group();root.add(flowLines);for(const isBypass of [true,false])for(let j=0;j<8;j++){let arr=[];for(let t=0;t<=60;t++){const q=path(t/60,j*TAU/8,.5,isBypass);arr.push(new THREE.Vector3(...q));}flowLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arr),new THREE.LineBasicMaterial({color:isBypass?0x4f9db3:0xc38e4f,transparent:true,opacity:.11,depthWrite:false})));}
 function path(t,a,layer,bypass){const x=-5.1+t*11.2;let rr;if(bypass){rr=x<-3.3?1.25+layer*.44:x<1.55?1.18+layer*.35:1.27+layer*.34+(x-1.55)*.035;}else{rr=x<-2?.59+layer*.12:x<.1?.63+layer*.09:x<1.55?.72+layer*.14:x<3.7?.66+layer*.25:.42+layer*.34;}return [x,Math.cos(a)*rr,Math.sin(a)*rr];}
 let lpAngle=0,hpAngle=0,flowTime=0,explosion=0,selected=0;
 function update(dt,state){if(state.playing){const speed=.32+state.power/100*1.1;lpAngle+=dt*speed;hpAngle+=dt*speed*1.65;flowTime+=dt*(.065+state.power/100*.095);}rotors.forEach(r=>r.group.rotation.x=r.spool==='lp'?lpAngle:hpAngle);shaftLP.rotation.x=lpAngle;shaftHP.rotation.x=hpAngle;
 const target=state.explode?1:0;explosion+= (target-explosion)*Math.min(1,dt*8);if(Math.abs(target-explosion)<.001)explosion=target;sections.forEach(s=>s.group.position.x=s.x+s.offset*explosion);shaftLP.visible=shaftHP.visible=explosion<.03;
 casings.forEach(m=>m.visible=!state.cutaway);halves.forEach(m=>m.visible=state.cutaway);particles.visible=flowLines.visible=state.airflow&&explosion<.01;
 for(let i=0;i<seeds.length;i++){const s=seeds[i],t=(s.t+flowTime)%1,p=path(t,s.a,s.layer,s.bypass);positions.set(p,i*3);const c=s.bypass?cBlue:p[0]<.2?cCool:cHot;colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;
 combustion.forEach((f,i)=>{f.scale.x=.21+state.power/100*.19+Math.sin(flowTime*130+i)*.018;f.material.opacity=.4+state.power/100*.3;});
 }
 function select(id){selected=id;Object.values(mats).forEach(m=>m.emissive?.setHex(0)); // highlighting uses overlay, so shared metal stays consistent
 highlight.position.x=sections[id].group.position.x;highlight.scale.set(1,id===0?1.94:id<3?1.11:id===3?1.09:1.26,id===0?1.94:id<3?1.11:id===3?1.09:1.26);
 }
 const highlight=new THREE.Group();root.add(highlight);const indicator=torus(1,.008,new THREE.MeshBasicMaterial({color:0x2656df,transparent:true,opacity:.5}),highlight);highlight.visible=true;
 function tick(dt,state){update(dt,state);highlight.position.x=sections[selected].group.position.x-.18;}
 select(0);
 return {root,sections,rotors,stators,pickables,casings,halves,particles,flowLines,update:tick,select,path,spools:()=>({lp:lpAngle,hp:hpAngle}),explosion:()=>explosion};
}
