import { Pool } from 'pg';


const pool = new Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});

export async function createReservation(req: any, res: any) {
    const reservation = req.body.reservation
    // selects data for table loading

    try {
        const query = `INSERT INTO reservas (id_user, id_sala, hora_desde, hora_hasta, fecha) VALUES ($1, $2, $3, $4, $5);`;
        const queryResult = await pool.query(query, [reservation.id_user, reservation.id_sala, reservation.hora_desde, reservation.hora_hasta, reservation.fecha]);

        const response = {
            success: true,
            data: queryResult,
            error: ''
        }

        res.json(response);
    } catch (err) {
        const response = {
            success: false,
            data: '',
            error: err
        }

        res.json(response);
    }

}