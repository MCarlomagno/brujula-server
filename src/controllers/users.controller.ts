import { Pool } from 'pg';
import { sign } from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';


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
    if (queryResultUser.rowCount === 0) {
        return res.status(401).json({ message: "El usuario no existe" });
    }
    const userId = queryResultUser.rows[0].id;
    const queryResultPassword = await pool.query("SELECT id FROM users WHERE password = crypt($1, password) AND id = $2;", [password, userId]);
    if (queryResultPassword.rowCount === 0) {
        return res.status(401).json({ message: "Contrasena incorrecta" });
    }
    const token = sign({ id: userId }, process.env.SECRETKEY);
    res.status(200).json({ message: "welcome", token, data: req.body })
}

export async function forgotPassword(req: any, res: any) {
    const email = req.params.email;
    try {
        // creating random password for new user
        const pass = Math.random().toString(36).slice(-8);

        console.log(email);

        const queryResultUser = await pool.query("SELECT id, nombre, email, password FROM users WHERE email = $1", [email]);
        if (queryResultUser.rowCount === 0) {
            return res.status(401).json({ message: "El usuario no existe" });
        }

        // insert query to users
        const updatePasswordQuery = "UPDATE users SET password = crypt($1, gen_salt('bf')) WHERE email = $2";
        const queryResult = await pool.query(updatePasswordQuery, [pass, email]);


        // create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS
            }
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Juli de Brújula"', // sender address
            to: `marcoscarlomagno1@gmail.com, ${email}`, // list of receivers
            subject: "Bienvenidx a Brújula", // Subject line
            html: `<b>Hola! tu email/user es: ${email} y tu nueva contraseña: ${pass}</b>`, // html body
            text: 'test'
        });
        const response = {
            success: true,
        }
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        const response = {
            success: false,
            error: err
        }
        res.status(400).json(response);
    }
}

