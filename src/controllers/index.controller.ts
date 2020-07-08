import { Pool } from 'pg';


const pool = new Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb'
});

export async function getUsers(req: any, res: any) {
    const queryResult = await pool.query('SELECT * FROM users');
    console.log(queryResult.rows);
    res.json(queryResult.rows);
}

export async function getUserById(req: any, res: any) {
    const queryResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.status(200).json(queryResult.rows);
}

export async function postUsers(req: any, res: any) {
    console.log(req.body);
    const { nombre, email } = req.body;
    const queryResult = await pool.query('INSERT INTO users (nombre, email) VALUES ($1, $2)', [nombre, email]);
    res.json({
        message: "User added succesfully",
        body: {
            user: { nombre, email }
        }
    });
}

export async function deleteUser(req: any, res: any) {
    const queryResult = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(200).json(queryResult.rows);
}

export async function updateUser(req: any, res: any) {
    console.log(req.body);
    const { nombre, email } = req.body;
    const queryResult = await pool.query('UPDATE users SET nombre = $1, email = $2 WHERE id = $3', [nombre, email, req.params.id]);
    res.status(200).json(queryResult.rows);
}
