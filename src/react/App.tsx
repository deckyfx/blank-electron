import RxDBView from './rxdb/index';

import SQLiteView from './sqlite/index';

export default function App() {
  return (
  <div>
    <RxDBView />
    <SQLiteView />
  </div>
  );
}
