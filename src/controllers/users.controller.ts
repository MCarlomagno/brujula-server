import { Pool } from 'pg';
import { sign } from 'jsonwebtoken';


const pool = new Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
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

export async function loginUser(req: any, res: any) {
    console.log(req.body);
    const email = req.body.email;
    const password = req.body.password;
    const queryResultUser = await pool.query("SELECT id, nombre, email, password FROM users WHERE email = $1", [email]);
    // TODO: validate
    console.log('after query rows cournt: ' + queryResultUser.rowCount);
    if(queryResultUser.rowCount === 0) {
        return res.status(401).json({message: "El usuario no existe"});
    }
    const userId = queryResultUser.rows[0].id;
    const queryResultPassword = await pool.query("SELECT id FROM users WHERE password = crypt($1, password) AND id = $2;", [password, userId]);
    if(queryResultPassword.rowCount === 0) {
        return res.status(401).json({message: "Contrasena incorrecta"});
    }
    const token = sign({id: userId}, process.env.SECRETKEY);
    res.status(200).json({message: "welcome", token, data: req.body})
}