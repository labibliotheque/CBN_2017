// gérer les jours fériés et jours de fermeture grace à la date
var settings
var tables = []
var date
var startDate = "2017-01-01"
var endDate = "2017-04-30"
var play = false
var db;

function preload() {
    // charger les fichiers et les distribuer dans une structure de donnée en json
    tables.push(loadTable("../data/CBN_pretsjour_bibempl_1701.csv", "csv", "headers"));
    tables.push(loadTable("../data/CBN_pretsjour_bibempl_1702.csv", "csv", "headers"));
    tables.push(loadTable("../data/CBN_pretsjour_bibempl_1703.csv", "csv", "headers"));
    tables.push(loadTable("../data/CBN_pretsjour_bibempl_1704.csv", "csv", "headers"));
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    settings = QuickSettings.create(0, 0, "paramètres");
    settings.addButton("Play", datePlay);
    settings.addButton("Pause", datePause);
    settings.addButton("Reset", dateReset);
    settings.addBoolean("Loop", true, setLoop);
    settings.addDate("date de début", startDate, selectDateB);
    settings.addDate("date de fin", endDate, selectDateE);
    date = string2Date(startDate)
        //console.log(table.getRowCount() + " total rows in table");
        //console.log(table.getColumnCount() + " total columns in table");
        // nous allons construire une base de donnée au format json à partir d'une date de début et d'une date de fin.
    db = [];
    var ddebut = string2Date(startDate)
    var dfin = string2Date(endDate)
        // créeons toutes les entrées "date"
    while (!compareTwoDates(ddebut, dfin)) {
        db.push({
            date: date2String(ddebut)
        })
        ddebut = updateDate(ddebut)
    }
    console.log("nb de jours :", db.length)
    for (var i = 0; i < tables.length; i++) {
        //console.log(i)
        scrapData(tables[i])
    }
    // une passe pour ajouter les emplacements documentaires manquants
    for (var i = 0; i < db.length; i++) {
        for (var l = 0; l < lieux.length; l++) {
            if (db[i][lieux[l]] === undefined) {
                db[i][lieux[l]] = new Object()
               db[i][lieux[l]]["total"] = 0
            }
            for (var e = 0; e < emplacements.length; e++) {
                // console.log(db[i])
                if (db[i][lieux[l]][emplacements[e]] === undefined) {
                    db[i][lieux[l]][emplacements[e]] = 0
                }
            }
        }
    }
    // une passe pour calculer des statistiques
    // calculer les valeur de Tous pour chaque catégorie doc
    // pour une vision de l'ensemble des prêts sur tout le réseau par catégories
    for (var i = 0; i < db.length; i++) {
        for (var e = 0; e < emplacements.length; e++) {
            var total = 0
            for (var l = 0; l < lieux.length; l++) {
                total += int(db[i][lieux[l]][emplacements[e]])
            }
            db[i]["Tous"][emplacements[e]] = total
        }
    }
     // calculer pour chaque lieu l'emplacement documentaire le plus représenté à une date t, entrer null si zéro partout
    // ajouter une entrée texte dont la clé serait "top-emplacement"
    for (var i = 0; i < db.length-1; i++) {
        for (var l = 1; l < lieux.length; l++) {
            db[i][lieux[l]]["top-emplacement"] = ""
            let emax = 0
            for (var e = 0; e < emplacements.length; e++) {
                var newmax = int(db[i][lieux[l]][emplacements[e]]);
                if (newmax > emax) {
                    emax = newmax
                    db[i][lieux[l]]["top-emplacement"] = emplacements[e]
                }
            }
        }
    }

    // calculer le max de nombre de prêts sur l'historique complet
    // il faut ajouter une entrée "max" contenant un les max pour chaque catégorie documentaire
    //y compris "total "et les max pour chaque lieu
    //db["Stats"] = new Object();
    // ajouter l'entrée au début du tableau db
    db.unshift({
        Max : 0,
        Max_Total: 0,
        Max_Tous : 0

    })
    /*
    db["Stats"]["Max"] = 0
    db["Stats"]["Max Total"] = 0
    db["Stats"]["Max Tous"] = 0*/
    for (var l = 0; l < lieux.length; l++) db[0]["Max_" + lieux[l]] = 0
    for (var e = 0; e < emplacements.length; e++) db[0]["Max_" + emplacements[e]] = 0
    for (var i = 1; i < db.length; i++) {
        for (var l = 0; l < lieux.length; l++) {
            //calcul du max total de chaque lieu
            var tmax = int(db[i][lieux[l]]["total"])
            if (l != 0 && tmax > db[0]["Max_Total"]) db[0]["Max_Total"] = tmax
            for (var e = 0; e < emplacements.length; e++) {
                var newmax = int(db[i][lieux[l]][emplacements[e]])
                    //console.log(db[i].date, lieux[l], emplacements[e], newmax)
                if (newmax > db[0].Max && l != 0) db[0]["Max"] = newmax
                if (newmax > db[0]["Max_" + lieux[l]]) db[0]["Max_" + lieux[l]] = newmax
                if (newmax > db[0]["Max_" + emplacements[e]]) db[0]["Max_" + emplacements[e]] = newmax
                if (l == 0 && newmax > db[0]["Max_Tous"]) db[0]["Max_Tous"] = newmax
            }
        }
    }


    console.log(db)
    saveJSON(db,"db.json")
}

function string2Date(string) {
    var temp = string.split("-")
        // js date object counts months from 0 to 11 and days from 1 to 31
    var newDate = new Date(int(temp[0]), int(temp[1] - 1), int(temp[2]));
    return newDate
}

function date2String(date) {
    var string = date.toLocaleDateString();
    // this is an array
    return string
}

function compareTwoDates(d1, d2) {
    if (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate()) {
        return true
    }
    else {
        return false
    }
}

function draw() {
    background(0)
    if (play) {
        if (frameCount % 25 == 0) {
            date = updateDate(date);
            if (settings.getValuesAsJSON(false)["Loop"]) {
                // if( date.toLocaleDateString() === endDate)
                var currentDate = date.toLocaleDateString().split("/")
                var selectedEndDate = endDate.split("-")
                var selectedStartDate = startDate.split("-")
                    /* console.log(int(currentDate[0]), int(selectedEndDate[1]), int(currentDate[2]), int(selectedEndDate[0]), int(currentDate[1]), int(selectedEndDate[2]));*/
                if (int(currentDate[0]) == int(selectedEndDate[1]) && int(currentDate[2]) == int(selectedEndDate[0]) && int(currentDate[1]) == int(selectedEndDate[2])) {
                    date = new Date(int(selectedStartDate[0]), int(selectedStartDate[1] - 1), int(selectedStartDate[2]));
                    console.log("looping");
                }
            }
        }
    }
    fill(255);
    text(date.toDateString(), windowWidth / 2, windowHeight / 2);
    var index = date2dbIndex(date.toLocaleDateString())
    if (db[index].data !== undefined) {
        for (var i = 0; i < db[index].data.length; i++) {
            text(db[index].data[i].lieu + " : " + db[index].data[i].total + "prêts", windowWidth / 2, windowHeight / 2 + windowHeight * (i + 1) / 28)
        }
    }
}

function selectDateB() {
    startDate = settings.getValuesAsJSON(false)["date de début"]
}

function selectDateE() {
    endDate = settings.getValuesAsJSON(false)["date de fin"]
}

function datePlay() {
    play = true
    console.log("play", play)
}

function datePause() {
    play = false
}

function dateReset() {
    var selectedStartDate = startDate.split("-")
    date = date = new Date(int(selectedStartDate[0]), int(selectedStartDate[1] - 1), int(selectedStartDate[2]));
}

function setLoop() {}

function updateDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    // the Date object automatically controls what its given
    // so 32 will result in 1st of the next month
    // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Date
    day = day + 1;
    date = new Date(year, month, day);
    return date
}

function date2dbIndex(date) {
    var index = 0
        // console.log(date)
    for (var i = 0; i < db.length; i++) {
        if (db[i].date == date) {
            return i
            break
        }
    }
}

function scrapData(table) {
    // parcourons ces nouvelles entrées pour y insérer la data
    var index = 2; // index pour parcourir les colones du fichier csv contenant les qtés d'emprunts
    for (var i = 0; i < db.length; i++) {
        var dbdate = db[i].date.split("/")
            //  vérifier que  la date de notre db est bien présente dans nos donnéesé
        var tabledate = table.get(0, index).split("\n")[1].split("/")
            //console.log(dbdate, tabledate);
        if (!(int(dbdate[2].split("0")[1]) == int(tabledate[2]) && int(dbdate[1]) == int(tabledate[0]) && int(dbdate[0]) == int(tabledate[1]))) {
            //si ce n'est pas le cas on doit ajouter une entrée data dans le json avec des valeurs nulles : premier test = 2017 vs 17
            /*
            var temp = new Object() // un nouvel objet json
            for (var j = 0; j < lieux.length; j++) {
                temp = new Object()
                temp["total"] = 0
                for (var k = 0; k < emplacements.length; k++) {
                    temp[emplacements[k]] = 0 // on ajoute une entrée pour chaque emplacement documentaire avec une valeur de 0
                }
                db[i][lieux[j]] = temp // on insère notre tableau avec une nouvelle entrée "data"
                    //hashData.push(temp); // on ajoute notre nouvel objet à notre tableau
            }
             console.log("added",dbdate, tabledate)*/
        }
        else {
            // si c'est le cas on ajoute les données qui nous intéressent
            var temp2 = new Object()
            var lieuPre;
            // on parcourt le csv et on stocke les infos présentent au bon endroit, il faudra ensuite ajouter des 0
            // la première ligne est toujours la même Tous les lieux / total d'emprunts
            temp2["total"] = table.get(1, index)
            db[i][table.get(1, 0)] = temp2
                // on parcourt le reste
            for (var r = 2; r < table.getRowCount(); r++) {
                if (lieux.includes(table.get(r, 0))) {
                    // si la ligne est un lieu valide
                    if (lieuPre != null) {
                        // on vérifie qu'on est pas à la première iteration et on ajoute les donnés stockées précédement
                        db[i][lieuPre] = temp2
                    }
                    // on crée un nouvel objet et on récupère le volume total des prêts pour ce lieu à cette date
                    temp2 = new Object()
                    temp2["total"] = table.get(r, index)
                    lieuPre = table.get(r, 0) // on stocke temporairement la valeur du lieu
                        //console.log(db[i].date, "lieux", table.get(r, 0), "row", r, "val", table.get(r, index))
                }
                else if (emplacements.includes(table.get(r, 1).toLowerCase()) && lieuPre != table.get(r, 0)) {
                    // si la deuxième colone contient un emplacement et que la colone 0 n'est pas un nouveau lieu alors on stocke les données
                    temp2[table.get(r, 1).toLowerCase()] = table.get(r, index)
                        // console.log(db[i].date, lieuPre, "emplacement", table.get(r, 1).toLowerCase(), "row,", r, "val", table.get(r, index))
                    if (r == table.getRowCount() - 1) {
                        // si on est au bout du tableau on stocke les données de notre denier objet temporaire
                        db[i][lieuPre] = temp2
                    }
                }
            }
            //console.log("completed", dbdate, tabledate)
            if (table.get(0, index + 1) === undefined) {
                // il faudra changer de table ou casser la boucle
                // break
                //
            }
            else {
                // on incrémente notre index pour passer à la colone de données suivante celle ci existe
                index += 1
               // console.log(index, table.get(0, index))
            }
        }
    }
    // return db
}
