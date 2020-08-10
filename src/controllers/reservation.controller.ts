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

        res.status(200).json(response);
    } catch (err) {
        const response = {
            success: false,
            data: '',
            error: err
        }

        res.status(400).json(response);
    }

}

export async function getReservationByWeek(req: any, res: any) {
    let idSala = req.query.idSala;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;


    try {

        let salas = [];

        if (!idSala) {
            const salasQuery = `SELECT id, nombre FROM salas`;
            const salasQueryResult = await pool.query(salasQuery);
            salas = salasQueryResult.rows;
            idSala = salas[0].id;
        }

        const query = `SELECT r.id as id, u.nombre || ' ' || u.apellido as title, r.fecha + r.hora_desde AS start, r.fecha + r.hora_hasta AS end
        FROM reservas r INNER JOIN users u ON r.id_user = u.id
        WHERE r.id_sala = $1 AND r.fecha >= $2 AND r.fecha < $3;`;
        const queryResult = await pool.query(query, [idSala, dateFrom, dateTo]);

        const response = {
            success: true,
            data: {
                reservations: queryResult.rows,
                salas
            },
            error: ''
        }

        res.status(200).json(response);
    } catch (err) {
        const response = {
            success: false,
            data: '',
            error: err
        }

        res.status(400).json(response);
    }

}