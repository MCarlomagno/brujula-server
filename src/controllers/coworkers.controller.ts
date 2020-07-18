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


/// createCoworker
/// 1. Create coworker (insert)
/// 2. If its group leader update group (update)
/// 3. If not private office get free seats/puestos so set to the new coworker (select)
/// 4. creates the users_puestos instance (Insert).
export async function createCoworker(req: any, res: any) {
    const coworker = req.body.coworker;
    const usersPuestos = req.body.usersPuestos;

    // creating random password for new user
    const pass = Math.random().toString(36).slice(-8);

    // insert query to users
    const insertCoworkerQuery = "INSERT INTO users (nombre, apellido, email, password, is_coworker, id_grupo, dni, fecha_nacimiento, direccion, celular, id_plan, horas_sala_consumidas ) VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id;";
    const queryResult = await pool.query(insertCoworkerQuery, [coworker.nombre, coworker.apellido, coworker.email, pass, coworker.is_coworker, coworker.id_grupo, coworker.dni, coworker.fecha_nacimiento, coworker.direccion, coworker.celular, coworker.id_plan, coworker.horas_sala_consumidas]);

    if(coworker.is_leader) {
        const idLider = queryResult.rows[0].id;
        const idGrupo = coworker.id_grupo;

        // update query to groups (in case of group leader)
        const updateIdLeader = "UPDATE groups SET id_lider=$1 WHERE id=$2";
        const result = await pool.query(updateIdLeader, [idLider, idGrupo])
    }

    // select from puestos to set a free one to the user
    const puestosQuery = 'SELECT id FROM puestos WHERE disponible = true';
    const puestosQueryResult = await pool.query(puestosQuery);

    const idPuesto = puestosQueryResult.rows[0].id;
    const idUser = queryResult.rows[0].id;
    const horaDesde = usersPuestos.hora_desde.hours + ':' + usersPuestos.hora_desde.minutes;
    const horaHasta = usersPuestos.hora_hasta.hours + ':' + usersPuestos.hora_hasta.minutes;

    // insert query to users_puestos
    const insertUsersPuestosQuery = "INSERT INTO users_puestos (id_user, id_puesto, hora_desde, hora_hasta, fecha_desde, fecha_hasta, lunes, martes, miercoles, jueves, viernes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)";
    const queryResultUsersPuestos = await pool.query(insertUsersPuestosQuery, [idUser, idPuesto, horaDesde, horaHasta, usersPuestos.fecha_desde, usersPuestos.fecha_hasta, usersPuestos.dias[0],usersPuestos.dias[1], usersPuestos.dias[2], usersPuestos.dias[3], usersPuestos.dias[4]]);

    const response = {
        success: true,
        body: {
            coworker,
            usersPuestos,
            password: pass,
        },
    }
    res.json(response);
}