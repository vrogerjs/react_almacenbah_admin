import Dexie from 'dexie';

export const db = new Dexie('minsa');
db.version(3).stores({
  disabled: '++id', // Primary key and indexed props
  region:'code',
  province:'code',
  district:'code',
  red:'code',
  microred:'code'
});
