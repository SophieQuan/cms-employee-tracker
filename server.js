const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');

//=======================================================  VIEW ALL DEPARTMENT  ============================================================
const viewAllDepartment = () => {
    const sql = `SELECT * FROM department`;
    db.promise().query(sql)
        .then(([rows, fields]) => {
            console.log(``)
            console.log(`++++++++++++++++++++++++++++++++++++++++++++++`)
            console.log(`+           VIEWING ALL DEPARTMENTS          +`)
            console.log(`++++++++++++++++++++++++++++++++++++++++++++++`)
            console.log(`
                            `)
            console.table(rows);
            promptUser();
        })
        .catch(console.log)
};

//=======================================================  VIEW ALL EMPLOYEES  ============================================================
const viewAllEmployees = () => {
    const sql = `SELECT employee.id,
                        employee.first_name,
                        employee.last_name,
                        role.title,
                        department.name AS department,
                        role.salary,
                        CONCAT (manager.first_name, " " , manager.last_name) AS manager
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON employee.manager_id = manager.id;
                `;

    db.promise().query(sql)
        .then(([rows, fields]) => {
            console.log(``)
            console.log(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`)
            console.log(`+                                   VIEWING ALL EMPLOYEES                                +`)
            console.log(`++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`)
            console.log(``)
            console.table(rows);
            promptUser();
        })
        .catch(console.log)
};

//=======================================================  VIEW ALL ROLES  ============================================================
const viewAllRoles = () => {
    const sql = `SELECT role.id,
                        role.title,
                        department.name AS department,
                        role.salary
                FROM role
                LEFT JOIN department ON role.department_id = department.id;
                `;

    db.promise().query(sql)
        .then(([rows, fields]) => {
            console.log(``)
            console.log(`++++++++++++++++++++++++++++++++++++++++++++++`)
            console.log(`+              VIEWING ALL ROLES             +`)
            console.log(`++++++++++++++++++++++++++++++++++++++++++++++`)
            console.log(`
                            `)
            console.table(rows);
            promptUser();
        })
        .catch(console.log)
};

//========================================================  ADD A DEPARTMENT  ============================================================
const addDepartment = () => {
    inquirer
        .prompt(
            [{
                type: "input",
                name: "departmentInput",
                message: "What is the name of the department?",
                validate: departmentInput => {
                    valid = /^[a-zA-Z0-9_ ]{3,}$/.test(departmentInput);
                    return valid ? true : (console.log(" - Please enter a Department Name"), false)
                }
            }]
        )
        .then(answer => {
            const sql = `INSERT INTO department (name)
                 VALUE (?)`;
            const params = [answer.departmentInput];

            db.promise().query(sql, params)
                .then(() => {
                    console.log(`***    Added ${answer.departmentInput} to the database.  ***`)
                    promptUser();
                })
                .catch(console.log);
        })
};

//========================================================  ADD A ROLE  ============================================================
const addRole = () => {
    const sql = "SELECT * FROM department";
    db.query(sql, (err, data) => {
        if (err) console.log(err);
        inquirer
            .prompt(
                [{
                        name: "role",
                        type: "input",
                        message: "What is the name of the role?",
                        validate: roleTitle => {
                            valid = /^[a-zA-Z0-9_ ]{3,}$/.test(roleTitle);
                            return valid ? true : (console.log(" - Name must contain at least 3 characters."), false)
                        }
                    },
                    {
                        name: "salary",
                        type: "input",
                        message: "What is the salary of the role",
                        validate: salaryInput => {
                            valid = /^[0-9]{1,}$/.test(salaryInput);
                            return (valid ? true : (console.log(" - Please enter a valid number"), false))
                        }
                    },
                    {
                        name: "department",
                        type: "list",
                        message: "Which department does the role belong to?",
                        choices: () => {
                            let departmentList = [];
                            for (let i = 0; i < data.length; i++) {
                                departmentList.push(data[i].name);
                            }
                            return departmentList;
                        }
                    }
                ]
            )
            .then(answer => {
                let result;
                const sql = "INSERT INTO role SET ?";

                for (let i = 0; i < data.length; i++) {
                    if (data[i].name === answer.department) {
                        result = data[i];
                    }
                };
                const params = {
                    title: answer.role,
                    salary: answer.salary,
                    department_id: result.id
                };
                db.promise().query(sql, params)
                    .then(() => {
                        console.log(`***   Added ${answer.role} to the database.   ***`)
                        promptUser();
                    })
                    .catch(console.log);
            });
    });
};

//========================================================  ADD A EMPLOYEE  ============================================================
const addEmployee = () => {
    const sql = "SELECT * FROM employee, role";
    db.query(sql, (err, data) => {
        if (err) console.log(err);
        inquirer
            .prompt(
                [{
                        name: "first_name",
                        type: "input",
                        message: "What is the employee's first name?",
                        validate: name => {
                            valid = /^[a-zA-Z0-9_ ]{3,}$/.test(name);
                            return valid ? true : (console.log(" - Name must contain at least 3 characters."), false)
                        }
                    },
                    {
                        name: "last_name",
                        type: "input",
                        message: "What is the employee's last name?",
                        validate: name => {
                            valid = /^[a-zA-Z0-9_ ]{3,}$/.test(name);
                            return valid ? true : (console.log(" - Name must contain at least 3 characters."), false)
                        }
                    },
                    {
                        name: "role",
                        type: "rawlist",
                        message: "What is the employee's role?",
                        choices: () => {
                            let roleList = [];
                            for (let i = 0; i < data.length; i++) {
                                roleList.push(data[i].title);
                            }
                            let noDuplicateRoleList = [...new Set(roleList)];
                            return noDuplicateRoleList;
                        }
                    }
                ]
            )
            .then(answer => {
                let result;
                const sql = "INSERT INTO employee SET ?";

                for (let i = 0; i < data.length; i++) {
                    if (data[i].title === answer.role) {
                        result = data[i];
                    }
                };
                const params = {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: result.id
                };
                db.promise().query(sql, params)
                    .then(() => {
                        console.log(`***   Added ${answer.first_name} ${answer.last_name} as a ${answer.role} to the database.   ***`)
                        promptUser();
                    })
                    .catch(console.log);
            });
    });
};

//========================================================  UPDATE A EMPLOYEE  ============================================================
updateEmployee = () => {
    const sql = `SELECT * FROM employee`;

    db.query(sql, (err, data) => {
        if (err) console.log(err);
        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer
            .prompt(
                [{
                    type: 'list',
                    name: 'name',
                    message: "Which employee's role do you want to update?",
                    choices: employees
                }]
            )
            .then(selectedEmp => {
                const employee = selectedEmp.name;
                const params = [];
                params.push(employee);

                const roleSql = `SELECT * FROM role`;

                db.query(roleSql, (err, data) => {
                    if (err) console.log(err);
                    const roles = data.map(({ id, title }) => ({ name: title, value: id }));
                    inquirer
                        .prompt(
                            [{
                                type: 'list',
                                name: 'role',
                                message: "Which role do you want to assign the selected employee?",
                                choices: roles
                            }]
                        )
                        .then(roleChoice => {
                            const role = roleChoice.role;
                            params.push(role);

                            let employee = params[0]
                            params[0] = role
                            params[1] = employee

                            const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                            db.promise().query(sql, params)
                                .then(() => {
                                    console.log(`***   Update employee role successfully!   ***`)
                                    promptUser();
                                })
                                .catch(console.log);
                        });
                });
            });
    });
};

//========================================================  DELETE DEPARTMENT  ============================================================
deleteDepartment = () => {
    const mysql = `SELECT * FROM department`;

    db.query(mysql, (err, data) => {
        if (err) console.log(err);

        const selectedDepartment = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer.prompt([{
                type: 'list',
                name: 'department',
                message: "What department do you want to delete?",
                choices: selectedDepartment
            }])
            .then(answer => {
                const sql = `DELETE FROM department WHERE id = ?`;

                const selectedDepartment = answer.department;
                db.promise().query(sql, selectedDepartment)
                    .then(() => {
                        console.log(`***   Delete successfully!   ***`)
                        promptUser();
                    })
                    .catch(console.log);
            });
    });
};

//========================================================  DELETE ROLE  ============================================================
deleteRole = () => {
    const mysql = `SELECT * FROM role`;

    db.query(mysql, (err, data) => {
        if (err) console.log(err);

        const selectedRole = data.map(({ title, id }) => ({ name: title, value: id }));

        inquirer.prompt([{
                type: 'list',
                name: 'role',
                message: "What role do you want to delete?",
                choices: selectedRole
            }])
            .then(answer => {
                const sql = `DELETE FROM role WHERE id = ?`;

                const selectedRole = answer.role;
                db.promise().query(sql, selectedRole)
                    .then(() => {
                        console.log(`***   Delete successfully!   ***`)
                        promptUser();
                    })
                    .catch(console.log);
            });
    });
};

//========================================================  DELETE EMPLOYEE  ============================================================
deleteEmployee = () => {
    const mysql = `SELECT * FROM employee`;

    db.query(mysql, (err, data) => {
        if (err) console.log(err);

        const selectedEmployee = data.map(({ first_name, last_name, id }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer.prompt([{
                type: 'list',
                name: 'employeeName',
                message: "What role do you want to delete?",
                choices: selectedEmployee
            }])
            .then(answer => {
                const sql = `DELETE FROM role WHERE id = ?`;

                const selectedEmployee = answer.employeeName;
                db.promise().query(sql, selectedEmployee)
                    .then(() => {
                        console.log(`***   Delete successfully!   ***`)
                        promptUser();
                    })
                    .catch(console.log);
            });
    });
};

//========================================================  VIEW TOTAL BUDGET  ============================================================
const viewBudget = () => {
    const sql = `SELECT department_id AS id, 
                    department.name AS department,
                    SUM (salary) AS budget
                FROM role  
                JOIN department ON role.department_id = department.id GROUP BY department_id ORDER BY id`;
    db.promise().query(sql)
        .then(([rows, fields]) => {
            console.log(``)
            console.log(`++++++++++++++++++++++++++++++++++++++++++++++++++`)
            console.log(`+               VIEWING TOTAL BUDGET             +`)
            console.log(`++++++++++++++++++++++++++++++++++++++++++++++++++`)
            console.log(`
                `)
            console.table(rows);
            promptUser();
        })
        .catch(console.log)
};

//========================================================  PROMPT USER  ============================================================
const promptUser = () => {
    inquirer
        .prompt(
            [{
                type: 'rawlist',
                name: 'optionsList',
                message: 'What would you like to do?',
                choices: [
                    'View all Department',
                    'View all Employees',
                    'View all Roles',
                    'Add Department',
                    'Add Role',
                    'Add Employee',
                    'Update Employee Role',
                    'View Total Budget',
                    'Delete Department',
                    'Delete Role',
                    'Delete Employee',
                    'Exit',
                ]
            }]
        )
        .then((answers) => {
            const { optionsList } = answers;

            switch (optionsList) {
                case 'View all Department':
                    viewAllDepartment();
                    break;
                case 'View all Employees':
                    viewAllEmployees();
                    break;
                case 'View all Roles':
                    viewAllRoles();
                    break;
                case 'Add Department':
                    addDepartment();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmployee();
                    break;
                case 'View Total Budget':
                    viewBudget();
                    break;
                case 'Delete Department':
                    deleteDepartment();
                    break;
                case 'Delete Role':
                    deleteRole();
                    break;
                case 'Delete Employee':
                    deleteEmployee();
                    break;
                case 'Exit':
                    db.end();
            }

        })
};

promptUser();