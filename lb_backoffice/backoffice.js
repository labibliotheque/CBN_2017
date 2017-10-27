
// Configuration variables
//
var repositoryEndPoint = window.location.hostname == "localhost" || window.location.hostname == "" ? "http://localhost:4567" : "https://api.github.com"
var repositoryOwner = "labibliotheque"
var repositoryName = "CBN_2017"
var repositoryBranch = "gh-pages"
var dbPath = "data/db_06122017.json" // TODO no date in file name

var registeredLocations = ["Bourg", "Haute Chaussée", "Charles-Gautier-Hermeland", "Bellevue", "Ludothèque Municipale", "Gao Xingjian - Sillon"]
var registeredCategories = ["albums","arts","graphisme","bd adultes","bd jeunesse","cinema adultes","cinema jeunesse","cinema","danse","geographie","histoire","informatique","jeux d'assemblage","jeux d'exercices","livres sur les jeux","jeux a regles","jeux symboliques","jeux video","langues","litterature","loisirs creatifs","musique adultes","musique jeunesse","philosophie","presse","fonds pro","psychologie","romans adultes","romans jeunesse","religions","sciences","societe","sports et loisirs","vie pratique","theatre"]

var globalErrorMessage = "Une erreur est survenue, veuillez contacter votre support."

// link when update is completed with success
var completeRedirectURL = "../lb_geopacking/index.html"

// polling timeout to check github pages build status (avoid low values)
var buildPollingTimeoutMS = 3000

// whether to display imported CSV in the debug section (dev mode only)
var debugCSV = false

var commitMessageCSV = "Backoffice CSV backup"
var commitMessageJSON = "Backoffice JSON DB update"


// Global context variables
//
var currentContent = null
var currentMonth = null
var currentYear = null
var diagnostic = null
var currentSHA = null
var currentDB = null
var monthMap = null
var currentCSV = null
var lastMonth = null
var lastYear = null


// Debug
console.log("Endpoint : " + repositoryEndPoint)

// Code
//

function mapKeys(map){
    var keys = []
    for(var key in map) keys.push(key)
    return keys
}

function arrayToMap(array){
    var map = {}
    for(var i=0 ; i<array.length ; i++) map[array[i]] = true
    return map
}

var locationMap = arrayToMap(registeredLocations)
var categoryMap = arrayToMap(registeredCategories)


// utf8 base64 support from https://developer.mozilla.org/fr/docs/D%C3%A9coder_encoder_en_base64
function utf8_to_b64( str ) {
  return window.btoa(unescape(encodeURIComponent( str )));
}
function b64_to_utf8( str ) {
  return decodeURIComponent(escape(window.atob( str )));
}

function show(id){
    $(id).removeClass("hidden")
}
function hide(id){
    $(id).removeClass("hidden").addClass("hidden")
}

function makeAlert(type, message){
    return '<div class="alert alert-' + type + '">' + message + '</div>'
}

function displayStatusMessage(type, message){

    $('#section-status').html(makeAlert(type, message))

}

function ghConnect(event){

    hide('#section-login-error')
    hide('#bt-connect')

    $.ajax({
        type: "GET",
        url: repositoryEndPoint + "/user",
        beforeSend: github_before_send,
        success: function(data, status, xhr){
            loadCurrentDB()
            hide('#section-login')
            show('#section-import')
        },
        error: function(xhr, status, message){
            console.error(message)
            show('#section-login-error')
            show('#bt-connect')
        }
    });

}

function ghDisconnect(event){
    $('#gh-login').val("")
    $('#gh-pwd').val("")
    show('#bt-connect')
    hide('#bt-disconnect')
    hide('#section-import')
}

function loadCurrentDB(){


    github_get_content( dbPath, function( data ) {
        

        // TODO try/catch ?

        sha = data.sha
        currentDB = JSON.parse(b64_to_utf8(data.content))

        monthMap = {}
        for(var i=1 ; i<currentDB.length ; i++){
            var jsonDay = currentDB[i]
            var array = jsonDay.date.split("/")
            var month = parseInt(array[0]) - 1
            var year = parseInt(array[2])
            monthMap[month + "/" + year] = new Date(year, month, 1)
            lastMonth = month
            lastYear = year
        }


        var info = ""
        if(currentDB.length > 0){
            info += "<h3>Periodes :</h3><ul>"

            for(month in monthMap){
                info += "<li>" + monthMap[month].toLocaleString("fr", { month: "long" }) + " " + monthMap[month].getFullYear() + "</li>"
            }
            info += "</ul>"
        }else{
            info += "le site ne dispose pas encore de données"
        }

        $('#diagnostic-db').html(info)

    }, function(xhr, status, message){
        $('#diagnostic-db').html(makeAlert('danger', globalErrorMessage))
    })

}


function push_data(){

    var yy = ('' + currentYear).substr(-2)
    var mm = ('0' + currentMonth).substr(-2)

    var path = "data/CBN_pretsjour_bibempl_" + yy + mm + ".csv"    

    var csvString = $.csv.fromArrays(currentCSV)

    var data = {
        branch: repositoryBranch,
        message: commitMessageCSV,
        content: utf8_to_b64(csvString)
    }

    $.ajax({
        type: "PUT",
        url: repositoryEndPoint + "/repos/" + repositoryOwner + "/" + repositoryName + "/contents/" + path,
        contentType: "application/json",
        data: JSON.stringify(data),
        beforeSend: github_before_send,
        success: function(data, status, xhr){
            github_check_build()
        },
        error: function(xhr, status, message){
            console.error(message)
            displayStatusMessage("danger", globalErrorMessage)
        }
    });

}

function actionCancelImport(event){
    $('#diagnostic').html("")
    $('#debug').html("")
    hide('#section-commit')
}

function actionCommit(event){

    hide('#section-commit')
    hide('#tainput')

    // append current month
    for(var i=0 ; i<currentContent.length ; i++){
        currentDB.push(currentContent[i])
    }
    
    // update max (TODO separate in another function !)
    currentDB[0] = {}

    // update max for locations
    var maxAllLocations = 0
    for(var location in locationMap){
        var maxForLocation = 0
        for(var i=1 ; i<currentDB.length ; i++){
            var topCategory = currentDB[i][location]["top-emplacement"]
            if(topCategory.trim() == "") continue
            max = parseInt(currentDB[i][location][topCategory])
            if(max > maxForLocation) maxForLocation = max
        }
        if(maxForLocation > maxAllLocations) maxAllLocations = maxForLocation
        currentDB[0]["Max_" + location] = maxForLocation
    }
    currentDB[0]["Max"] = maxAllLocations // OK

    // update max for categories
    var maxAllCategories = 0
    for(category in categoryMap){
        var maxForCategory = 0
        for(var i=1 ; i<currentDB.length ; i++){
            max = parseInt(currentDB[i]['Tous'][category])
            if(max > maxForCategory) maxForCategory = max
        }
        if(maxForCategory > maxAllCategories) maxAllCategories = maxForCategory
        currentDB[0]["Max_" + category] = maxForCategory
    }
    currentDB[0]["Max_Tous"] = maxAllCategories

    var maxAllTotal = 0
    for(var i=1 ; i<currentDB.length ; i++){
        max = parseInt(currentDB[i]['Tous']['total'])
        if(max > maxAllTotal) maxAllTotal = max
    }
    currentDB[0]["Max_Total"] = maxAllTotal




    github_patch_file(dbPath, sha, currentDB)
}

function github_get_content(filePath, success, error){

    $.ajax({
        type: "GET",
        url: repositoryEndPoint + "/repos/" + repositoryOwner + "/" + repositoryName + "/contents/" + filePath + "?ref=" + repositoryBranch,
        beforeSend: github_before_send,
        success: success,
        error: error
    });

}

function github_before_send(xhr){
    var ghUsername = $('#gh-login').val()
    var ghPassword = $('#gh-pwd').val()
    xhr.setRequestHeader ("Authorization", "Basic " + btoa(ghUsername + ":" + ghPassword));
}

function github_patch_file(filePath, sha, newContent){

    var data = {
        branch: repositoryBranch,
        message: commitMessageJSON,
        sha: sha,
        content: utf8_to_b64(JSON.stringify(newContent, null, "  "))
    }

    $.ajax({
        type: "PUT",
        url: repositoryEndPoint + "/repos/" + repositoryOwner + "/" + repositoryName + "/contents/" + filePath,
        contentType: "application/json",
        data: JSON.stringify(data, null, "  "),
        beforeSend: github_before_send,
        success: function(){
            push_data()
        },
        error: function(xhr, status, message){
            displayStatusMessage("danger", globalErrorMessage)
            console.error(message)
        }
    });

}

function buildMessage(status){
    return "Les donnée ont bien été enregistrée, le site est en cours de déploiement, veuillez patienter... (status: " + status + ")"
}

function github_check_build(){

    displayStatusMessage("warning", buildMessage('started'))

    $.ajax({
        type: "GET",
        url: repositoryEndPoint + "/repos/" + repositoryOwner + "/" + repositoryName + "/pages/builds/latest",
        beforeSend: github_before_send,
        success: function(data, status, xhr){

            switch(data.status){
            case 'null':
            case 'queued':
            case 'building':
                displayStatusMessage("warning", buildMessage(data.status))
                window.setTimeout(github_check_build, buildPollingTimeoutMS)
                break;
            default:
            case 'errored':
                displayStatusMessage("danger", globalErrorMessage)
                break;
            case 'built':
                var link = '<a href="' + completeRedirectURL + '">vérifier en accédant au site</a>'
                displayStatusMessage("success", "Les donnée ont bien été enregistrée, le site est bien déployé, vous pouvez " + link + " ou fermer cette page.")
                break;
            }
            
        },
        error: function(xhr, status, message){
            displayStatusMessage("danger", globalErrorMessage)
            console.error(message)
        }
    });
}


$(function(){
   


    $("#tainput").on('paste', function(event) {

        event.preventDefault();
        var text = null;
        if (window.clipboardData) 
          text = window.clipboardData.getData("Text");
        else if (event.originalEvent && event.originalEvent.clipboardData)
          text = event.originalEvent.clipboardData.getData("Text");

        diagnostic = []
        try{
            parse_raw_data(text)
        }catch(e){
            if(e instanceof CSVImportError){
                diagnostic.push({status: 'danger', message: e.message})
            }else{
                diagnostic.push({status: 'danger', message: "Le format de votre tableur est incorrect. Erreur technique : " + e.message})
            }
            console.error(e)
        }
        
        var statusMap = {}
        for(var i in diagnostic){
            statusMap[diagnostic[i].status] = true
        }

        var msg = ""

        if(statusMap['danger'] === undefined){
            show('#section-commit')

            if(statusMap['warning'] !== undefined){
                msg += makeAlert('warning', "Des anomalies ont été détectés dans vos donnée à importer. Veuillez prendre connaissance des points d'attention ci-dessous avant d'enregistrer ou ré-importez vos données une fois corrigées.")
            }else{
                msg += makeAlert('success', "Les données sont valide. Vous pouvez enregistrer.")
            }
        }else{
            msg += makeAlert('danger',  "Les donnée sont invalides et ne peuvent être importés")
        }

        

        msg += "<ul>"
        for(var i in diagnostic) msg += '<li class="text-' + diagnostic[i].status + '">' + diagnostic[i].message + "</li>"
        msg += "</ul>"

        $('#diagnostic').html(msg)

        
    });


});


function csvDateToJsDate(str){
    regexp_date = /.*(\d{2})\/(\d{2})\/(\d{2})/i
    var elements = regexp_date.exec(str)
    var day = parseInt(elements[1])
    var mon = parseInt(elements[2])
    var year = parseInt(elements[3])
    return new Date(2000 + year, mon-1, day)
}

function CSVImportError(message) {
    this.name = 'CSVImportError';
    this.message = message;
    this.stack = (new Error()).stack;
}
CSVImportError.prototype = new Error;



function parse_raw_data(data){

    var matrix = currentCSV = $.csv.toArrays(data, {separator: "\t"});

    if(debugCSV){
        var r = "<table>"

        for(var i in matrix){

            line = matrix[i]
            r += "<tr>"
            for(var j in line){
                var cell = line[j]
                r += "<td>" + cell + "</td>"
            }
            r += "</tr>"
        }
        r += "</table>"

        $('#debug').html(r)
    }

    // scrap

    // parse column header (containing dates)



    var firstDate = csvDateToJsDate(matrix[0][2])
    var month = firstDate.getMonth()
    var year = firstDate.getFullYear()
    var firstDay = 1
    var lastDay = new Date(year, month+1, 0).getDate()

    currentMonth = month+1
    currentYear = year

    var currentPeriodeString = firstDate.toLocaleString("fr", { month: "long" }) + " " + year

    // check existing month
    if(monthMap[month + "/" + year] !== undefined) throw new CSVImportError("Des données pour " + currentPeriodeString + " existe déjà.")

    // check consecutive month
    if(lastMonth !== null && lastYear !== null){
        var nextDate = new Date(lastYear, lastMonth + 1, 1)
        var expectedYear = nextDate.getFullYear()
        var expectedMonth = nextDate.getMonth()
        if(expectedYear !== year || expectedMonth !== month){
            var expectedPeriodeString = nextDate.toLocaleString("fr", { month: "long" }) + " " + expectedYear
           
            throw new CSVImportError("Des données pour " + expectedPeriodeString + " sont attendu, veuillez importer " + expectedPeriodeString + " avant " + currentPeriodeString)
        }
    }


    diagnostic.push({status: 'success', message: "Donnée pour " + currentPeriodeString + " du " + firstDay + " au " + lastDay})

    // parse header to build index
    var columnIndexByDay = []
    for(var i=firstDay ; i<=lastDay ; i++) columnIndexByDay[i] = null

    for(var col = 2 ; col < matrix[0].length ; col++){

        var date = csvDateToJsDate(matrix[0][col])

        if(date.getFullYear() != year || date.getMonth() != month) throw new CSVImportError("Le tableur ne doit contenir que des donnée pour un seul mois.")

        var day = date.getDate()

        if(day < firstDay || day > lastDay) throw new CSVImportError("Le tableur contient une date non valide : " + date)

        columnIndexByDay[day] = col
        
    }



    
 
    // prepare default data with empty placeholder
    json = []
    for(var day=firstDay ; day<=lastDay ; day++)
    {
        var jsonDay = {date: (month+1) + "/" + day + "/" + year}
        for(var location in locationMap){
            var jsonLocation = jsonDay[location] = {}
            for(var category in categoryMap){
                jsonLocation[category] = 0
            }
        }
        json.push(jsonDay)
    }

    var unsupportedLocations = {}
    var unsupportedCategories = {}

    // parse CSV data
    var location = null
    for(var row=2 ; row < matrix.length ; row++){

        var locCell = matrix[row][0].trim()
        if(locCell.length > 0) location = locCell

        if(location == null) throw new CSVImportError("ligne 1 / colonne 1 ne doit pas être vide ...")

        if(locationMap[location] === undefined){
            unsupportedLocations[location] = true
            continue
        }

        var category = matrix[row][1].trim().toLowerCase()
        if(category.length == 0) throw new CSVImportError("ligne " + (row+1) + " / colonne 2 ne doit pas être vide ...")
        if(categoryMap[category] === undefined){
            unsupportedCategories[category] = true
            continue
        }


        for(var day in columnIndexByDay){

            var col = columnIndexByDay[day]
            if(col === null) continue

            var cell = matrix[row][col]

            json[day - firstDay][location][category] = parseInt(cell)
        }

    }

    var unsupportedLocationsList = mapKeys(unsupportedLocations)
    if(unsupportedLocationsList.length > 0)
        diagnostic.push({status: 'warning', message: "Lieux ignorés : " + unsupportedLocationsList}) 

    var unsupportedCategoriesList = mapKeys(unsupportedCategories)
    if(unsupportedCategoriesList.length > 0)
        diagnostic.push({status: 'warning', message: "Emplacements ignorés : " + unsupportedCategoriesList}) 


    // compute sum's
    for(var i in json){
        var jsonDay = json[i]
        for(var location in locationMap){
            var jsonLocation = jsonDay[location]
            var locationTotal = 0
            for(var category in categoryMap){
                locationTotal += jsonLocation[category]
            }
            jsonLocation['total'] = locationTotal
        }
    }

    // compute top categories
    for(var i in json){
        var jsonDay = json[i]
        for(var location in locationMap){
            var topCategory = ""
            var topCount = 0
            for(var category in categoryMap){
                var count = jsonDay[location][category]
                if(count > topCount){
                    topCount = count
                    topCategory = category
                }
            }
            jsonDay[location]["top-emplacement"] = topCategory
        }
    }

    // add sums by category for each days
    var totalBorrows = 0
    for(var i in json){
        var jsonDay = json[i]
        var jsonAll = {}
        var totalDay = 0
        for(var category in categoryMap){
            jsonAll[category] = 0
            for(var location in locationMap){
                jsonAll[category] += jsonDay[location][category]
            }
            totalDay += jsonAll[category]
            totalBorrows += jsonAll[category]
        }
        jsonAll['total'] = totalDay
        jsonDay['Tous'] = jsonAll
    }
    
    diagnostic.push({status: 'success', message: "Total des prêts : " + totalBorrows})

    jsonString = JSON.stringify(json, null, "    ")

    currentContent = json
}