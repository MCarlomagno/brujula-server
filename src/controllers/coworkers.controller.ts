import { Pool } from 'pg';


const pool = new Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});


export async function getCoworkers(req: any, res: any) {
    const queryResult = await pool.query('SELECT nombre, apellido, email FROM users WHERE is_coworker = true');
    console.log(queryResult.rows);
    res.json(queryResult.rows);
}