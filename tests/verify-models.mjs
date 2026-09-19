import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const project=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const three=pathToFileURL(path.join(project,'dist/vendor/three.module.js')).href;
for(const name of ['rotary','radial','steam','stirling','electric','rocket']){
 const source=fs.readFileSync(path.join(project,'dist/engines',name+'.js'),'utf8').replace("from 'three'",`from '${three}'`);
 const {createModel}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const model=createModel(),max=name==='rotary'?1080:name==='radial'?720:360;
 const state={playing:false,power:45,cutaway:true,explode:false};
 for(let angle=0;angle<=max;angle+=max/144){
  model.setAngle(angle);model.update(0,state);model.root.updateMatrixWorld(true);
  assert(Number.isFinite(model.getReadout().angle));
  model.root.traverse(o=>o.matrixWorld.elements.forEach(v=>assert(Number.isFinite(v),'Nonfinite pose')));
  if(name==='radial')for(const link of model.root.userData.linkages)assert(Math.abs(Math.hypot(link.to[0]-link.from[0],link.to[1]-link.from[1])-link.length)<1e-9,'Rod length changed');
 }
 model.root.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v),'Nonfinite vertex');});
 const before=model.getReadout().angle;model.update(.3,state);assert.equal(model.getReadout().angle,before,'Pause failed');
 model.update(.2,{...state,playing:true});assert.notEqual(model.getReadout().angle,before,'Motion did not advance');
 model.update(0,{...state,cutaway:false,explode:true});model.update(0,state);
 for(let i=0;i<model.parts.length;i++)model.select(i);
 if(name==='stirling'){
  const fins=model.pickables.filter(o=>o.userData.part===0&&o.geometry.type==='TorusGeometry');assert.equal(fins.length,6);
  for(const fin of fins)assert(fin.geometry.parameters.radius-fin.geometry.parameters.tube>=.65-1e-9,'Fin blocks cylinder bore');
  const passage=model.pickables.find(o=>o.userData.part===4&&o.geometry.type==='CylinderGeometry'&&Math.abs(o.position.x-.85)<1e-6);assert(passage.material.transparent&&passage.material.opacity<.3,'Gas tracer hidden');
 }
 console.log(`${name}: geometry, cycle poses, playback, views, selection passed`);
}
