const msg = 'Hello...............................';
console.log(msg);

//require module 
const cheerio = require("cheerio");
const fs = require("fs");

//variable declare
global.content = "";

var a = 0;

//SQL Connection 
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "xbyte",
});


con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

    //Create Database
    let createDatabase = `create database if not exists test_with_node_js1`
    con.query(createDatabase, function (err, results, fields) {
        if (err) {
            console.log(err.message);
        }
    });
});

//Connection with database
var dbcon = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "xbyte",
    database: "test_with_node_js1",
});

dbcon.connect(function (err) {
    if (err) throw err;
    console.log("DBCON Connected!");

    //Create Table
    let createTable = `create table  if not exists details(
                            Id int primary key auto_increment,
                            Status varchar(10) default 'Pending',
                            URL varchar(155),
                            Title varchar(255),
                            Description varchar(255),
                            Review varchar(50),
                            Primary_image varchar(255)
    )`;
    dbcon.query(createTable, function (err, results, fields) {
        if (err) {
            console.log(err.message);
        }
    });

    //Select Require data from Table
    let selectData = `select ID,URL from details where Status='Pending'`;
    dbcon.query(selectData, function (err, results, fields) {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log(results)
            Object.keys(results).forEach(function (key) {
                var row = results[key];
                id = row.ID
                console.log(id)
                var url = row.URL
                console.log(url)

                //Check File is Exist or Not
                try {
                    if (fs.existsSync(`Product_${id}.html`)) {
                        console.log("Page Exist...........")

                        fs.readFile(`Product_${id}.html`, function read(err, data) { //Read data from the File
                            if (err) {
                                throw err;
                            }
                            content = data.toString()
                            a += 1;
                            scrape(content)
                        });
                    }
                    else {
                        try {
                            //Sending Request
                            const request = require('request');
                            request(url, function (error, response, content) {
                                console.error('error:', error); // Print the error if one occurred
                                console.log('statusCode:', response && response.statusCode)
                                fs.appendFileSync(`Product_${id}.html`, content, (err) => { //Write data in a file
                                    if (err) {
                                        console.log("Failed");
                                        return
                                    }
                                    console.log("Inserted");
                                });
                                a += 1;
                                scrape(content); //Call the Function
                            });
                        }
                        catch (err) {
                            console.log("Request --------", err) //// Print the Exception if one occurred

                        }
                    }
                    function scrape(content) {
                        if (a == 1) {
                            let $ = cheerio.load(content) //Cheerio is a tool for parsing HTML and XML in Node. js
                            var json_data = $('script[type="application/ld+json"]').text() //Xpath
                            console.log("Json loaded")

                            const jsonData = JSON.parse(json_data)  // Load data
                            console.log("LOADED DATA--------------", jsonData);

                            // Product_Name ------
                            var name = jsonData[1]['name'] 
                            name= name.replace("'","")
                            console.log("NAME-------", name)

                            // Product_Description ----
                            var desc = jsonData[1]['description']
                            desc = desc.replace("'","")
                            console.log("Description-------", desc)

                            // url ----
                            console.log("URL-------", url)


                            // Product_Review --------
                            var review = jsonData[1]['aggregateRating']['ratingValue']
                            console.log("Review-------", review)

                            // Primary_Image ---------
                            var img = jsonData[1]['image']['url']
                            if (img == undefined) {
                                img = jsonData['image']
                            }
                            else {
                                img = img
                            }
                            console.log("Image-------", img)
                        }

                        // var sql = `INSERT INTO final (Title, URL ,Description, Review, Primary_Image) VALUES ('${name}', '${url}' ,"${desc}", '${review}', '${img}')`;
                        var update = `UPDATE details SET Status='Done', Title='${name}', Description="${desc}", Review='${review}', Primary_image='${img}' WHERE Id=${id}`;
                        console.log(update)
                        dbcon.query(update, function (err, result) {
                            if (err) throw err;
                            console.log("1 record Updated");
                        });
                    }
                }
                catch (err) { console.log("Error in Page Save--------", err) }

            });
        }
    });
});




