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
    const query = 'SELECT u.nombre, u.apellido, u.email, p.horas_sala, u.horas_sala_consumidas FROM users u INNER JOIN plans p ON u.id_plan = p.id WHERE is_coworker = true';
    const queryResult = await pool.query(query);
    console.log(queryResult.rows);
    res.json(queryResult.rows);
}