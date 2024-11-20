import localforage from 'localforage'

try {
  await localforage.setItem('somekey', 'testval');
  const value = await localforage.getItem('somekey');
  // This code runs once the value has been loaded
  // from the offline store.
  console.log('local forage',  value);
} catch (err) {
  // This code runs if there were any errors.
  console.log(err);
}