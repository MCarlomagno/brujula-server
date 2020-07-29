import { Pool } from 'pg';


const pool = new Pool({
    host: process.env.DBHOST || 'localhost',
    port: 5432,
    user: process.env.DBUSER || 'postgres',
    password: process.env.DBPASS || 'du3nak7Q7LdaPGr',
    database: process.env.DBNAME || 'brujuladb',
    ssl: true
});


export async function getGroups(req: any, res: any) {

    // table filters
    const itemsPerPage = req.query.pageSize;
    const pageNumber = req.query.pageNumber;
    const order = req.query.sortOrder;
    const filter = req.query.filter;


    // selects data for table loading
    // LIMIT gets the items and number of page
    const query = `SELECT id, nombre, id_lider, cuit_cuil
                    FROM groups
                    WHERE LOWER(nombre) LIKE '%' || LOWER($3) || '%'
                    ORDER BY created_at DESC
                    LIMIT $1 OFFSET ($2::numeric * $1)`;
    const queryResult = await pool.query(query, [itemsPerPage, pageNumber, filter]);
    res.json(queryResult.rows);
}

export async function getAllGroups(req: any, res: any) {
    const query = `SELECT id, nombre, id_lider, cuit_cuil
                    FROM groups`;
    const queryResult = await pool.query(query);
    res.json(queryResult.rows);
}


export async function getGroupsCount(req: any, res: any) {
    const query = 'SELECT COUNT(*) FROM groups';
    const queryResult = await pool.query(query);
    res.json(queryResult.rows[0]);
}

export async function createGroup(req: any, res: any) {
    const group = req.body.group;
    try {
        // insert query to users
        const insertCoworkerQuery = "INSERT INTO groups (nombre, cuit_cuil, id_lider, created_at) VALUES ($1, $2, NULL, CURRENT_TIMESTAMP) RETURNING id;";
        const queryResult = await pool.query(insertCoworkerQuery, [group.nombre, group.cuit_cuil]);
        group.id = queryResult.rows[0].id;
        const response = {
            success: true,
            body: {
                group,
            },
        }
        console.log('createGroup performed successfully!');
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


export async function editGroup(req: any, res: any) {
    const group = req.body.group;
    const idGroup = req.params.id;
    try {
        // insert query to users
        const insertCoworkerQuery = "UPDATE groups SET nombre = $1, cuit_cuil=$2 WHERE id=$3";
        const queryResult = await pool.query(insertCoworkerQuery, [group.nombre, group.cuit_cuil, idGroup]);
        const response = {
            success: true,
            body: {
                group,
            },
        }
        console.log('editGroup performed successfully!');
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


export async function deleteGroup(req: any, res: any) {
    const idGroup = req.params.id;
    try {
        try {
            const deleteUsersPuestosQuery = 'DELETE FROM groups WHERE id = $1';
            const usersPuestosQueryResult = await pool.query(deleteUsersPuestosQuery, [idGroup]);
        } catch (err) {
            console.log(err);
            const dbErrorResponse = {
                success: false,
                error: 'Existen coworkers asociados a este grupo'
            };
            res.status(400).json(dbErrorResponse);
        }


        const response = {
            success: true,
            error: '',
            body: {},
        }
        return res.status(200).json(response);

    } catch (err) {
        console.log(err);
        const response = {
            success: false,
            error: err
        }
        res.status(400).json(response);
    }
}

export async function getGroupById(req: any, res: any) {
    const idGrupo = req.params.id;
    const query = 'SELECT id, nombre, cuit_cuil FROM groups WHERE id = $1';
    const queryResult = await pool.query(query, [idGrupo]);
    res.json(queryResult.rows[0]);
}


