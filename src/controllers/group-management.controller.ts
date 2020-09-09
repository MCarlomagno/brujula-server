import { Pool } from 'pg';
import * as nodemailer from 'nodemailer';


const pool = new Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});


export async function getGroupCoworkers(req: any, res: any) {

    const idLeader = req.params.idLeader;
    // table filters
    const itemsPerPage = req.query.pageSize;
    const pageNumber = req.query.pageNumber;
    const order = req.query.sortOrder;
    const filter = req.query.filter;
    const bornDate = req.query.bornDate;
    let plan = req.query.plan;
    let groupId = 0;

    try {

        if (plan === 'null') {
            plan = 0;
        } else {
            plan = parseInt(plan, 10);
            // plan === -1  means that the user selected customized in the front
            if (plan === 0) {
                plan = -1;
            }
        }

        // selects the group id to filter
        if (idLeader !== 'null') {
            const groupsQuery = 'SELECT id FROM groups WHERE id_lider = $1';
            const groupsQueryResult = await pool.query(groupsQuery, [idLeader]);
            groupId = groupsQueryResult.rows[0].id;
        } else {
            console.log('no leader selected');
            const responseErr = {
                success: false,
                error: 'no leader selected'
            };
            res.status(400).json(responseErr)
        }


        // selects data for table loading
        // in the where, matches the filter value with nombre, apellido and email
        // LIMIT gets the items and number of page
        const query = `SELECT u.id, u.nombre, u.apellido, u.email, p.horas_sala, u.horas_sala_consumidas, u.fecha_nacimiento, u.id_plan, u.id_grupo as id_grupo, p.is_custom as is_custom
                    FROM users u INNER JOIN plans p ON u.id_plan = p.id
                    WHERE is_coworker = true
                    AND (LOWER(u.nombre) LIKE '%' || LOWER($3) || '%' OR LOWER(u.apellido) LIKE '%' || LOWER($3) || '%' OR LOWER(u.email) LIKE '%' || LOWER($3) ||'%')
                    AND ($4 = 0 OR u.id_plan = $4 OR ($4 = -1 AND p.is_custom))
                    AND ($5 = 0 OR u.id_grupo = $5)
                    AND ($6 LIKE 'null' OR DATE_PART('day', u.fecha_nacimiento) = DATE_PART('day',TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) AND DATE_PART('month', u.fecha_nacimiento) = DATE_PART('month',TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')))
                    ORDER BY u.created_at DESC
                    LIMIT $1 OFFSET ($2::numeric * $1)`;
        let queryResult;
        queryResult = await pool.query(query, [itemsPerPage, pageNumber, filter, plan, groupId, bornDate]);



        // Count
        const countQuery = `SELECT COUNT(*) as coworkersCount
                    FROM users u INNER JOIN plans p ON u.id_plan = p.id
                    WHERE is_coworker = true
                    AND (LOWER(u.nombre) LIKE '%' || LOWER($1) || '%' OR LOWER(u.apellido) LIKE '%' || LOWER($1) || '%' OR LOWER(u.email) LIKE '%' || LOWER($1) ||'%')
                    AND ($2 = 0 OR u.id_plan = $2 OR ($2 = -1 AND p.is_custom))
                    AND ($3 = 0 OR u.id_grupo = $3)
                    AND ($4 LIKE 'null' OR DATE_PART('day', u.fecha_nacimiento) = DATE_PART('day',TO_TIMESTAMP($4, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) AND DATE_PART('month', u.fecha_nacimiento) = DATE_PART('month',TO_TIMESTAMP($4, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')))`;

        let countQueryResult;
        countQueryResult = await pool.query(countQuery, [filter, plan, groupId, bornDate]);



        const resultRows = [...queryResult.rows];
        const countResult = countQueryResult.rows[0].coworkerscount;


        const response = {
            coworkers: resultRows,
            coworkersCount: countResult
        }

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        const response = {
            success: false,
            error: err
        };
        res.status(400).json(response)
    }

}