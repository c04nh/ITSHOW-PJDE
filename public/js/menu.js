import { createConnection } from 'mysql';

const db = createConnection({
  host     : '192.168.0.14',
  user     : 'root',
  password : '111111',
  database : 'PJDE'
});

db.connect();

export default db;

var sql = 'select * from project;';

db.query(sql, function (err, result, fields) {
    console.log(result);
});