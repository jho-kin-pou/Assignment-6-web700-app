const Sequelize = require('sequelize');
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', '75jsrAYTyfvW', {
    host: 'ep-mute-sea-a5au0ybu-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    dialectModule: pg,
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING,
    course: Sequelize.INTEGER
});

var Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

Course.hasMany(Student, { foreignKey: 'course' });

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
            .then(() => resolve())
            .catch((error) => reject("unable to sync the database: " + error));
    });
};

module.exports.getAllStudents = function () {
    return new Promise(function (resolve, reject) {
        Student.findAll()
            .then((students) => {
                resolve(students);
            })
            .catch((error) => reject("Unable to retrieve students: " + error));
    });
};

module.exports.getCourses = function () {
    return new Promise(function (resolve, reject) {
        Course.findAll()
            .then((courses) => {
                resolve(courses);
            })
            .catch((error) => {
                reject("Unable to retrieve courses: " + error);
            });
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                studentNum: num
            }
        })
            .then((students) => {
                if (students.length > 0) {
                    resolve(students[0]);
                } else {
                    reject("no results returned");
                }
            })
            .catch((error) => reject("unable to retrieve student by number: " + error));
    });
};

module.exports.getStudentsByCourse = function (courseId) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                course: courseId
            }
        })
            .then((students) => {
                resolve(students)
            })
            .catch((error) => reject("unable to retrieve students by course: " + error));
    });
};

module.exports.addStudent = function (studentData) {
    return new Promise(function (resolve, reject) {
        studentData.TA = (studentData.TA) ? true : false;
        for (let key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }
        Student.create(studentData)
            .then(() => {
                resolve();
            })
            .catch((error) => reject("unable to create student: " + error));
    });
};

module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.findAll({
            where: {
                courseId: id
            }
        })
            .then((courses) => {
                if (courses.length > 0) {
                    resolve(courses[0]);
                } else {
                    reject("no results returned");
                }
            })
            .catch((error) => reject("unable to retrieve course: " + error));
    });
};

module.exports.updateStudent = function (studentData) {
    return new Promise(function (resolve, reject) {
        studentData.TA = (studentData.TA) ? true : false;
        for (let key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }
        Student.update(studentData, {
            where: {
                studentNum: studentData.studentNum
            }
        })
            .then(() => {
                resolve();
            })
            .catch((error) => reject("unable to update student: " + error));
    });
};

module.exports.addCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (let key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }
        Course.create(courseData)
            .then(() => {
                resolve();
            })
            .catch(() => reject("unable to create course"));
    });
};

module.exports.updateCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        for (let key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }
        Course.update(courseData, {
            where: {
                courseId: courseData.courseId
            }
        })
            .then((result) => {
                if (result[0] > 0) {
                    resolve();
                } else {
                    reject("no course found to update");
                }
            })
            .catch(() => reject("unable to update course"));
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: {
                courseId: id
            }
        })
            .then((rowsDeleted) => {
                if (rowsDeleted > 0) {
                    resolve();
                } else {
                    reject("no course found to delete");
                }
            })
            .catch(() => reject("unable to delete course"));
    });
};

module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: {
                studentNum: studentNum
            }
        })
            .then((rowsDeleted) => {
                if (rowsDeleted === 1) {
                    resolve();
                } else {
                    reject('Student not found');
                }
            })
            .catch((err) => {
                reject('Unable to remove student');
            });
    });
}