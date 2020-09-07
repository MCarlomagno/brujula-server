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


export async function getCoworkers(req: any, res: any) {

    // table filters
    const itemsPerPage = req.query.pageSize;
    const pageNumber = req.query.pageNumber;
    const order = req.query.sortOrder;
    const filter = req.query.filter;

    let group = req.query.group;
    const bornDate = req.query.bornDate;
    let plan = req.query.plan;

    try {

        if (group === 'null') {
            group = 0;
        } else {
            group = parseInt(group, 10);
        }

        if (plan === 'null') {
            plan = 0;
        } else {
            plan = parseInt(plan, 10);
            // plan === -1  means that the user selected customized in the front
            if (plan === 0) {
                plan = -1;
            }
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
        queryResult = await pool.query(query, [itemsPerPage, pageNumber, filter, plan, group, bornDate]);



        // Count
        const countQuery = `SELECT COUNT(*) as coworkersCount
                    FROM users u INNER JOIN plans p ON u.id_plan = p.id
                    WHERE is_coworker = true
                    AND (LOWER(u.nombre) LIKE '%' || LOWER($1) || '%' OR LOWER(u.apellido) LIKE '%' || LOWER($1) || '%' OR LOWER(u.email) LIKE '%' || LOWER($1) ||'%')
                    AND ($2 = 0 OR u.id_plan = $2 OR ($2 = -1 AND p.is_custom))
                    AND ($3 = 0 OR u.id_grupo = $3)
                    AND ($4 LIKE 'null' OR DATE_PART('day', u.fecha_nacimiento) = DATE_PART('day',TO_TIMESTAMP($4, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')) AND DATE_PART('month', u.fecha_nacimiento) = DATE_PART('month',TO_TIMESTAMP($4, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')))`;

        let countQueryResult;
        countQueryResult = await pool.query(countQuery, [filter, plan, group, bornDate]);



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

export async function getCoworkersCount(req: any, res: any) {
    const query = 'SELECT COUNT(*) FROM users u INNER JOIN plans p ON u.id_plan = p.id WHERE is_coworker = true';
    const queryResult = await pool.query(query);
    res.json(queryResult.rows[0]);
}


///  returns the user, user_puesto, plan and group (if exist) by user id
export async function getCoworkerById(req: any, res: any) {
    const id = req.params.id;

    // Variables to be returned
    let coworker;
    let plan;
    let groups: any[];
    let puestos: any[];
    let userPuesto;

    try {
        // users query
        const query = 'SELECT id, nombre, email, apellido, dni, fecha_nacimiento, direccion, celular, id_plan, horas_sala_consumidas, id_grupo FROM users WHERE id = $1';
        const coworkerQueryResult = await pool.query(query, [id]);
        coworker = coworkerQueryResult.rows[0];
    } catch (err) {
        console.log('error querying coworker');
        console.log(err);
        const resultError = {
            success: false,
            msg: err
        }
        res.status(400).json(resultError);
    }

    try {
        // plans query
        const query = 'SELECT id, horas_sala, is_custom, nombre, descripcion FROM plans WHERE id = $1';
        const coworkerQueryResult = await pool.query(query, [coworker.id_plan]);
        plan = coworkerQueryResult.rows[0];
    } catch (err) {
        console.log('error querying plan');
        console.log(err);
        const resultError = {
            success: false,
            msg: err
        }
        res.status(400).json(resultError);
    }


    try {
        // groups query
        const query = 'SELECT id, id_lider, nombre, cuit_cuil FROM groups';
        const coworkerQueryResult = await pool.query(query);
        groups = coworkerQueryResult.rows;
    } catch (err) {
        console.log('error querying groups');
        console.log(err);
        const resultError = {
            success: false,
            msg: err
        }
        res.status(400).json(resultError);
    }

    try {
        // users_puestos query
        const query = 'SELECT id, id_user, id_puesto, hora_desde, hora_hasta, fecha_desde, fecha_hasta, lunes, martes, miercoles, jueves, viernes, sabado FROM users_puestos WHERE id_user = $1';
        const coworkerQueryResult = await pool.query(query, [id]);
        userPuesto = coworkerQueryResult.rows[0];
    } catch (err) {
        console.log('error querying userPuesto');
        console.log(err);
        const resultError = {
            success: false,
            msg: err
        }
        res.status(400).json(resultError);
    }

    try {
        // users_puestos query
        const puestosQuery = 'SELECT id, numero, nombre FROM puestos WHERE disponible = true';
        const puestosQueryResult = await pool.query(puestosQuery);
        puestos = puestosQueryResult.rows;
    } catch (err) {
        console.log('error querying userPuesto');
        console.log(err);
        const resultError = {
            success: false,
            msg: err
        }
        res.status(400).json(resultError);
    }

    const result = {
        success: true,
        coworker,
        plan,
        groups,
        userPuesto,
        puestos
    }
    res.json(result);
}

/// createCoworker
/// 1. Create coworker (insert)
/// 2. If its group leader update group (update)
/// 3. If not private office get free seats/puestos so set to the new coworker (select)
/// 4. creates the users_puestos instance (Insert).
export async function createCoworker(req: any, res: any) {
    const coworker = req.body.coworker;
    const usersPuestos = req.body.usersPuestos;
    const selectedPlan = req.body.selectedPlan;

    // creating random password for new user
    const pass = Math.random().toString(36).slice(-8);
    try {

        if (selectedPlan.is_custom) {
            const insertPlanQuery = "INSERT INTO plans (horas_sala, is_custom, nombre, descripcion) VALUES ($1, $2, $3, $4) RETURNING id;";
            const insertPlanQueryResult = await pool.query(insertPlanQuery, [selectedPlan.horas_sala, selectedPlan.is_custom, selectedPlan.nombre, selectedPlan.descripcion]);
            selectedPlan.id = insertPlanQueryResult.rows[0].id;
            coworker.id_plan = insertPlanQueryResult.rows[0].id;
        }

        const insertCoworkerQuery = "INSERT INTO users (nombre, apellido, email, password, is_coworker, id_grupo, dni, fecha_nacimiento, direccion, celular, id_plan, horas_sala_consumidas, created_at) VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP) RETURNING id;";
        const queryResult = await pool.query(insertCoworkerQuery, [coworker.nombre, coworker.apellido, coworker.email, pass, coworker.is_coworker, coworker.id_grupo, coworker.dni, coworker.fecha_nacimiento, coworker.direccion, coworker.celular, coworker.id_plan, coworker.horas_sala_consumidas]);

        if (coworker.is_leader) {
            const idLider = queryResult.rows[0].id;
            const idGrupo = coworker.id_grupo;

            // update query to groups (in case of group leader)
            const updateIdLeader = "UPDATE groups SET id_lider=$1 WHERE id=$2";
            const result = await pool.query(updateIdLeader, [idLider, idGrupo])
        }


        /// START SET ROLES
        /// TODO ROLE ADMIN
        const id = queryResult.rows[0].id;
        if (coworker.is_leader) {
            const insertUsersRoles = "INSERT INTO roles_users (id_user, id_rol) VALUES ($1, 1)";
            const resultinsertUsersRoles = await pool.query(insertUsersRoles, [id]);
        } else {
            const insertUsersRoles = "INSERT INTO roles_users (id_user, id_rol) VALUES ($1, 3)";
            const resultinsertUsersRoles = await pool.query(insertUsersRoles, [id]);
        }
        /// END SET ROLES

        if (coworker.id_plan !== 4) {

            let idPuesto;

            // if the admin didnt select puesto
            if (!usersPuestos.id_puesto) {

                // select from puestos to set a free one to the user
                const puestosQuery = 'SELECT id FROM puestos WHERE disponible = true';
                const puestosQueryResult = await pool.query(puestosQuery);
                idPuesto = puestosQueryResult.rows[0].id;

            } else {
                idPuesto = usersPuestos.id_puesto;
            }

            const idUser = queryResult.rows[0].id;
            const horaDesde = usersPuestos.hora_desde ? usersPuestos.hora_desde.hours + ':' + usersPuestos.hora_desde.minutes : null;
            const horaHasta = usersPuestos.hora_hasta ? usersPuestos.hora_hasta.hours + ':' + usersPuestos.hora_hasta.minutes : null;

            // insert query to users_puestos
            const insertUsersPuestosQuery = "INSERT INTO users_puestos (id_user, id_puesto, hora_desde, hora_hasta, fecha_desde, fecha_hasta, lunes, martes, miercoles, jueves, viernes, sabado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)";
            const queryResultUsersPuestos = await pool.query(insertUsersPuestosQuery,
                [idUser, idPuesto, horaDesde,
                    horaHasta, usersPuestos.fecha_desde, usersPuestos.fecha_hasta,
                    usersPuestos.dias[0], usersPuestos.dias[1], usersPuestos.dias[2],
                    usersPuestos.dias[3], usersPuestos.dias[4], usersPuestos.dias[5]]);
        }

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
            to: `marcoscarlomagno1@gmail.com, ${coworker.email}`, // list of receivers
            subject: "Bienvenidx a Brújula", // Subject line
            html: `<b>Bienvenidx, tu email/user: ${coworker.email} tu nueva contraseña: ${pass}</b>`, // html body
            text: 'test'
        });

        const response = {
            success: true,
            body: {
                coworker,
                usersPuestos,
                password: pass,
            },
        }
        console.log('createCoworker performed successfully!');
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

/// updates coworker, usersPuestos and/or plan if someone is in the req.
export async function updateCoworker(req: any, res: any) {
    const coworker = req.body.coworker;
    const usersPuestos = req.body.usersPuestos;
    const selectedPlan = req.body.selectedPlan;
    const idCoworker = req.params.id;

    try {

        if (selectedPlan) {
            // insert query to plans
            if (selectedPlan.is_custom) {
                const insertPlanQuery = "INSERT INTO plans (horas_sala, is_custom, nombre, descripcion) VALUES ($1, $2, $3, $4) RETURNING id;";
                const insertPlanQueryResult = await pool.query(insertPlanQuery, [selectedPlan.horas_sala, selectedPlan.is_custom, selectedPlan.nombre, selectedPlan.descripcion]);
                selectedPlan.id = insertPlanQueryResult.rows[0].id;
            }

            if (coworker) {
                coworker.id_plan = selectedPlan.id;
            } else {
                const updateCoworkerAfterPlansQuery = "UPDATE users SET id_plan = $2 WHERE id = $1";
                const queryResult = await pool.query(updateCoworkerAfterPlansQuery, [idCoworker, selectedPlan.id]);
            }
            console.log('plan created');
        }

        // update query to users
        if (coworker) {

            // gets id_grupo to check changes in groups
            const idGrupo = coworker.id_grupo;

            if (coworker.id_grupo === 0) {
                coworker.id_grupo = null;
            }

            const updateCoworkerQuery = "UPDATE users SET nombre = $2, apellido = $3, email = $4, id_grupo = $5, dni = $6, fecha_nacimiento = $7, direccion = $8, celular = $9, id_plan = $10 WHERE id = $1";
            const queryResult = await pool.query(updateCoworkerQuery, [coworker.id, coworker.nombre, coworker.apellido, coworker.email, coworker.id_grupo, coworker.dni, coworker.fecha_nacimiento, coworker.direccion, coworker.celular, coworker.id_plan]);



            // when idGrupo === 0 the user does not have group
            if (idGrupo !== 0) {
                if (coworker.is_leader) {
                    const idLider = idCoworker;
                    // update query to groups (in case of group leader)
                    const updateIdLeader = "UPDATE groups SET id_lider=$1 WHERE id=$2";
                    const result = await pool.query(updateIdLeader, [idLider, idGrupo])
                } else {
                    // if the user is leader and the role was changed, sets the group leader on null (no leader selected)
                    const updateIdLeader = "UPDATE groups SET id_lider=NULL WHERE id_lider=$1";
                    const resultUpdateIdLeader = await pool.query(updateIdLeader, [idCoworker])
                }
            } else {
                // if the user is leader and the role was changed, sets the group leader on null (no leader selected)
                const updateIdLeader = "UPDATE groups SET id_lider=NULL WHERE id_lider=$1";
                const resultUpdateIdLeader = await pool.query(updateIdLeader, [idCoworker])
            }

            console.log('coworker updated');
        }

        if (usersPuestos) {
            const horaDesde = usersPuestos.hora_desde ? usersPuestos.hora_desde.hours + ':' + usersPuestos.hora_desde.minutes : null;
            const horaHasta = usersPuestos.hora_hasta ? usersPuestos.hora_hasta.hours + ':' + usersPuestos.hora_hasta.minutes : null;
            // update query to users_puestos
            console.log(usersPuestos.dias);
            const updateUsersPuestosQuery = "UPDATE users_puestos SET hora_desde = $1, hora_hasta = $2, fecha_desde = $3, fecha_hasta = $4, id_puesto=$5, lunes = $6, martes = $7, miercoles = $8, jueves =$9, viernes = $10, sabado = $11 WHERE id_user = $12";
            const queryResultUsersPuestos = await pool.query(updateUsersPuestosQuery, [horaDesde, horaHasta, usersPuestos.fecha_desde, usersPuestos.fecha_hasta, usersPuestos.id_puesto,
                usersPuestos.dias[0], usersPuestos.dias[1], usersPuestos.dias[2],
                usersPuestos.dias[3], usersPuestos.dias[4], usersPuestos.dias[5], usersPuestos.id_user]);

            console.log('users puestos updated');
        }

        const response = {
            success: true,
            body: {
                coworker,
                usersPuestos,
                selectedPlan
            },
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

export async function deleteCoworker(req: any, res: any) {
    const idUser = req.params.id;
    try {
        const updateGroupLeader = 'UPDATE groups SET id_lider = NULL WHERE id_lider = $1';
        const coworkerQueryResult = await pool.query(updateGroupLeader, [idUser]);

        const deleteUsersPuestosQuery = 'DELETE FROM users_puestos WHERE id_user = $1';
        const usersPuestosQueryResult = await pool.query(deleteUsersPuestosQuery, [idUser]);

        const deleteReservasQuery = 'DELETE FROM reservas WHERE id_user = $1';
        const reservasQueryResult = await pool.query(deleteReservasQuery, [idUser]);

        const selectPlanId = 'SELECT id_plan FROM users WHERE id = $1';
        const selectPlanIdResult = await pool.query(selectPlanId, [idUser]);
        const plan = selectPlanIdResult.rows[0];

        const deletePlanQuery = 'DELETE FROM plans WHERE id = $1 AND is_custom = true';
        const deletePlanQueryResult = await pool.query(deletePlanQuery, [plan.id]);

        const deleteRolesQuery = 'DELETE FROM roles_users WHERE id_user = $1';
        const deleteRolesQueryResult = await pool.query(deleteRolesQuery, [idUser]);

        const deleteCoworkerQuery = 'DELETE FROM users WHERE id = $1';
        const deleteCoworkerQueryResult = await pool.query(deleteCoworkerQuery, [idUser]);

        // TODO implement delete on reservas, users roles

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

export async function getAllPlanesAndGropus(req: any, res: any) {
    try {
        let plans = [];
        let groups = [];

        try {
            const selectPlans = 'SELECT id, horas_sala, is_custom, nombre, descripcion FROM plans WHERE is_custom = false';
            const plansQueryResult = await pool.query(selectPlans);
            plans = plansQueryResult.rows;
        } catch (e) {
            console.log('error searching plans');
            console.log(e);
            const responseError = {
                success: false,
                error: e
            }
            res.status(400).json(responseError);
        }

        try {
            const selectGroups = 'SELECT id, id_lider, nombre, cuit_cuil FROM groups';
            const groupsQueryResult = await pool.query(selectGroups);
            groups = groupsQueryResult.rows;
        } catch (e) {
            console.log('error searching groups');
            console.log(e);
            const responseError = {
                success: false,
                error: e
            }
            res.status(400).json(responseError);
        }

        const response = {
            success: true,
            plans,
            groups,
        };
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


export async function getAllGroupsAndPuestos(req: any, res: any) {
    try {
        let groups = [];
        let puestos = [];

        const groupsQuery = `SELECT id, nombre, id_lider, cuit_cuil, id_oficina
        FROM groups`;
        const groupsQueryResult = await pool.query(groupsQuery);
        groups = groupsQueryResult.rows;

        const puestosQuery = `SELECT id, nombre, numero
        FROM puestos`;
        const puestosQueryResult = await pool.query(puestosQuery);
        puestos = puestosQueryResult.rows;

        const response = {
            success: true,
            puestos,
            groups
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

