import {deflateRawSync} from 'node:zlib';

const table=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let n=0xffffffff;for(const byte of bytes)n=table[(n^byte)&255]^(n>>>8);return (n^0xffffffff)>>>0;}

// Deterministic ZIP32, UTF-8 paths, raw DEFLATE and a fixed DOS date.
// Input entries are generated project files; directories and links are not packed.
export function createZip(entries){
 if(entries.length>65535)throw new Error('Too many ZIP entries');
 const names=new Set(),local=[],central=[];let offset=0;
 for(const {name,data} of [...entries].sort((a,b)=>a.name.localeCompare(b.name,'en'))){
  if(!name||name.startsWith('/')||name.includes('\\')||name.split('/').some(p=>!p||p==='..'||p==='.')||names.has(name))throw new Error('Invalid ZIP entry: '+name);
  names.add(name);
  const filename=Buffer.from(name),body=Buffer.from(data),packed=deflateRawSync(body,{level:9}),crc=crc32(body);
  if(filename.length>65535||body.length>0xffffffff||packed.length>0xffffffff||offset>0xffffffff)throw new Error('ZIP32 limit exceeded');
  const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(packed.length,18);header.writeUInt32LE(body.length,22);header.writeUInt16LE(filename.length,26);
  local.push(header,filename,packed);
  const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt16LE(8,10);record.writeUInt16LE(33,14);record.writeUInt32LE(crc,16);record.writeUInt32LE(packed.length,20);record.writeUInt32LE(body.length,24);record.writeUInt16LE(filename.length,28);record.writeUInt32LE(offset,42);
  central.push(record,filename);offset+=header.length+filename.length+packed.length;
 }
 const directory=Buffer.concat(central);if(offset+directory.length>0xffffffff)throw new Error('ZIP32 limit exceeded');
 const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...local,directory,end]);
}
