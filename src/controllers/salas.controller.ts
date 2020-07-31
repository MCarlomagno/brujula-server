import { Pool } from 'pg';


const pool = new Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});

export async function getSalas(req: any, res: any) {

    // selects data for table loading
    const query = `SELECT id, nombre
                    FROM salas`;
    const queryResult = await pool.query(query);
    res.json(queryResult.rows);
}