/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Jeffery Ho Kin Pou
*  Student ID: jho-kin-pou (151600236)
*  Date: 11 August 2024
*
*  Online (vercel) Link: 
*
********************************************************************************/


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

const path = require('path');
const collegeData = require('./modules/collegeData');
const exphbs = require('express-handlebars');
const data = require('./modules/collegeData.js');

app.engine('.hbs', exphbs.engine({
    extname: '.hbs', defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

app.get('/students/add', (req, res) => {
    collegeData.getCourses()
        .then((data) => {
            res.render('addStudent', { courses: data });
        })
        .catch(() => {
            res.render('addStudent', { courses: [] });
        });
});

app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students');
        })
        .catch(error => {
            console.error('Error adding student: ', error);
            res.status(500).send('Error adding student');
        });
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => { res.redirect("/students") })
        .catch(err => {
            res.status(500).send("Unable to update student");
        });
});

app.get('/students', (req, res) => {
    if (req.query.course) {
        data.getStudentsByCourse(parseInt(req.query.course)).then((students) => {
            if (students.length > 0) {
                res.render("students", { students: students });
            } else {
                res.render("students", { message: "No students found for this course." });
            }
        }).catch((err) => {
            res.status(500).render("students", { message: "Unable to retrieve students for this course." });
        });
    } else {
        data.getAllStudents().then((students) => {
            if (students.length > 0) {
                res.render("students", { students: students });
            } else {
                res.render("students", { message: "No students found." });
            }
        }).catch((err) => {
            res.status(500).render("students", {message: "Unable to retrieve students." });
        });
    }
});

/*
app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            if (courses.length > 0) {
                res.render('courses', { courses: courses });
            } else {
                // Render with an empty array and a message
                res.render('courses', { courses: [], message: "No courses available." });
            }
        })
        .catch((error) => {
            // Render with an empty array and an error message
            res.render('courses', { courses: [], message: "Unable to retrieve courses: " + error.message });
        });
});
*/

app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            if (courses.length > 0) {
                res.render("courses", { courses: courses });
            } else {
                res.render("courses", { message: "No courses found." });
            }
        })
        .catch((error) => {
            res.render("courses", { message: "Unable to retrieve courses: " + error });
        });
});

app.get('/courses/add', (req, res) => {
    res.render('addCourse');
});

app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect('/courses');
        })
        .catch((error) => {
            res.status(500).send("Unable to add course: " + error);
        });
});

app.post('/course/update', (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect('/courses');
        })
        .catch((error) => {
            res.status(500).send("Unable to update course: " + error);
        });
});

app.get("/student/:studentNum", (req, res) => {

    // Initialize an empty object to store the values
    let viewData = {};

    // Fetch the student data by studentNum
    data.getStudentByNum(req.params.studentNum)
        .then((data) => {
            if (data) {
                viewData.student = data; // Store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // Set student to null if none were returned
            }
        })
        .catch((err) => {
            viewData.student = null; // Set student to null if there was an error
        })
        .then(data.getCourses) // Fetch all courses
        .then((data) => {
            viewData.courses = data; // Store course data in the "viewData" object as "courses"

            // Loop through viewData.courses and once we have found the courseId that matches
            // the student's "course" value, add a "selected" property to the matching viewData.courses object
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }

        })
        .catch((err) => {
            viewData.courses = []; // Set courses to empty if there was an error
        })
        .then(() => {
            if (viewData.student == null) { // If no student is found, return a 404 error
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData }); // Render the "student" view
            }
        });
});

app.get('/student/delete/:studentNum', (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect('/students');
        })
        .catch((error) => {
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});

app.get('/course/:id', (req, res) => {
    const courseId = Number(req.params.id);
    collegeData.getCourseById(courseId)
        .then((data) => {
            if (!data) {
                res.status(404).send("Course Not Found");
            } else {
                res.render('course', { course: data });
            }
        }).catch((error) => {
            res.status(500).send("Error retrieving course data: " + error);
        });
});

app.get('/courses/delete/:id', (req, res) => {
    const courseId = Number(req.params.id);
    collegeData.deleteCourseById(courseId)
        .then(() => {
            res.redirect('/courses');
        })
        .catch((error) => {
            res.status(500).send("Unable to Remove Course / Course not found");
        });
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo');
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

collegeData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("server listening on port: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(`Failed to initialize data: ${err}`);
});