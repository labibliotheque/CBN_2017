
// TODO le faire en 2 phases :
// 1 - importer un nouveau mois (ou supprimer ou remplacer)
// 2 - générer le json final pour une periode donnée (reparsing des tableurs ou generation json ?) => storage du csv raw quand même pour futur récuération / si errors

// Configuration variables
//
var repositoryEndPoint = window.location.hostname == "localhost" ? "http://localhost:4567" : "http://localhost:6666" // TODO put github URL : https://api.github.com
var repositoryOwner = "labibliotheque"
var repositoryName = "CBN_2017"
var repositoryBranch = "gh-pages"
var dbPath = "data/db_06122017.json" // TODO no date in file name

// Global context variables
//
var currentContent = null
var currentMonth = null
var diagnostic = null
var currentSHA = null
var currentDB = null
var monthMap = null
var locationMap = {}
var categoryMap = {}

// utf8 base64 support from https://developer.mozilla.org/fr/docs/D%C3%A9coder_encoder_en_base64
function utf8_to_b64( str ) {
  return window.btoa(unescape(encodeURIComponent( str )));
}
function b64_to_utf8( str ) {
  return decodeURIComponent(escape(window.atob( str )));
}


function ghConnect(event){

    // TODO refactor this
    var ghUsername = $('#gh-login').val()
    var ghPassword = $('#gh-pwd').val()

    $.ajax({
        type: "GET",
        url: repositoryEndPoint + "/user",
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(ghUsername + ":" + ghPassword));
        },
        success: function(data, status, xhr){
            // TODO gui success massage and display other GUI
            console.log(status)
            console.log(data)

            // TODO need to load current DB to merge categories : yes !
            loadCurrentDB()

        },
        error: function(xhr, status, message){
            // TODO gui error message
            console.log(message)
        }
    });

}

function loadCurrentDB(){


    github_get_content( dbPath, function( data ) {
        console.log(data)

        sha = data.sha
        currentDB = JSON.parse(b64_to_utf8(data.content))

        // TODO display
        monthMap = {}
        for(var i=1 ; i<currentDB.length ; i++){
            var jsonDay = currentDB[i]
            var array = jsonDay.date.split("/")
            var month = parseInt(array[0]) - 1
            var year = parseInt(array[2])
            monthMap[month + "/" + year] = new Date(year, month, 1)
        }

        var info = "Periodes : <br>"
        for(month in monthMap){
            info += monthMap[month].toLocaleString("fr", { month: "long" }) + " " + monthMap[month].getFullYear() + "<br>"
        }


        $('#diagnostic-db').html(info)

        locationMap = {}
        categoryMap = {}

        // get all categories and all locations (just need the first one which already contains all locations and categories)
        for(var field in currentDB[1]){
            if(field == "date" || field == 'Tous') continue
            locationMap[field] = true
        }
        for(var field in currentDB[1]['Tous']){
            if(field == "total") continue
            categoryMap[field] = true
        }

    }, function(){
        console.error("problem ...")
    })

}


function push_data(event){

    var ghUsername = $('#gh-login').val()
    var ghPassword = $('#gh-pwd').val()

    var yy = "17"
    var mm = "11"

    var path = "data/CBN_pretsjour_bibempl_" + yy + mm + ".json"

    var content = {
        field1: 45,
        field2: "toto"
    }

    content = currentContent

    var data = {
        branch: repositoryBranch,
        message: "the commit message",
        content: btoa(JSON.stringify(content, null, "  "))
    }

    $.ajax({
        type: "PUT",
        url: repositoryEndPoint + "/repos/" + repositoryOwner + "/" + repositoryName + "/contents/" + path,
        contentType: "application/json",
        data: JSON.stringify(data),
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(ghUsername + ":" + ghPassword));
        }
    });

}

function merge_data(event){

    // complete old database with new locations and/or new categories
    for(var i=1 ; i<currentDB.length ; i++){
        var jsonDay = currentDB[i]
        for(var location in locationMap){
            if(jsonDay[location] === undefined){
                jsonDay[location] = {"total": 0, "top-emplacement": ""}
            }
            for(var category in categoryMap){
                if(jsonDay[location][category] === undefined){
                    jsonDay[location][category] = 0
                }
            }
        }
    }

    // TODO faire une vue différentiel avec avant/après pour vérifier les lieux et categories !!!! 

    // append current month
    for(var i=0 ; i<currentContent.length ; i++){
        currentDB.push(currentContent[i])
    }
    
    // update max (TODO separate in another function !)
    currentDB[0] = {}

    // update max for locations
    var maxAllLocations = 0
    for(location in locationMap){
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

    var ghUsername = $('#gh-login').val()
    var ghPassword = $('#gh-pwd').val()

    $.ajax({
        type: "GET",
        url: repositoryEndPoint + "/repos/" + repositoryOwner + "/" + repositoryName + "/contents/" + filePath + "?ref=" + repositoryBranch,
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(ghUsername + ":" + ghPassword));
        },
        success: success,
        error: error
    });

}

function github_patch_file(filePath, sha, newContent){

    var ghUsername = $('#gh-login').val()
    var ghPassword = $('#gh-pwd').val()

    var data = {
        branch: repositoryBranch,
        message: "the commit message",
        sha: sha,
        content: utf8_to_b64(JSON.stringify(newContent, null, "  "))
    }

    $.ajax({
        type: "PUT",
        url: repositoryEndPoint + "/repos/" + repositoryOwner + "/" + repositoryName + "/contents/" + filePath,
        contentType: "application/json",
        data: JSON.stringify(data, null, "  "),
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(ghUsername + ":" + ghPassword));
        },
        success: function(){
            console.log("ok")
        },
        error: function(){
            console.error("error ?")
        }
    });

}

// TODO GET /repos/:owner/:repo/pages/builds/latest pour voir quand les data sont bien à jour : see https://developer.github.com/v3/repos/pages/#request-a-page-build



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
            diagnostic.push({status: false, message: e.message}) // TODO not sure
            console.error(e)
        }

        var msg = "<ul>"
        for(var i in diagnostic) msg += '<li class="' + (diagnostic[i].status ? 'text-success' : 'text-danger') + '">' + diagnostic[i].message + "</li>"
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

function mapKeys(map){
    var keys = []
    for(var key in map) keys.push(key)
    return keys
}

function parse_raw_data(data){

    var matrix = $.csv.toArrays(data, {separator: "\t"});
    console.log(matrix)

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


    // scrap

    // parse column header (containing dates)

    

    var firstDate = csvDateToJsDate(matrix[0][2])
    var month = firstDate.getMonth()
    var year = firstDate.getFullYear()
    var firstDay = 1
    var lastDay = new Date(year, month+1, 0).getDate()

    var monthString = firstDate.toLocaleString("fr", { month: "long" })

    if(monthMap[month + "/" + year] !== undefined) throw new Error("Des données pour " + monthString + " " + year + " existe déjà.")

    diagnostic.push({status: true, message: "Donnée pour " + monthString + " " + year + " du " + firstDay + " au " + lastDay})

    // parse header to build index
    var columnIndexByDay = []
    for(var i=firstDay ; i<=lastDay ; i++) columnIndexByDay[i] = null

    for(var col = 2 ; col < matrix[0].length ; col++){

        var date = csvDateToJsDate(matrix[0][col])

        if(date.getFullYear() != year || date.getMonth() != month) throw new Error("Le tableur ne doit contenir que des donnée pour un seul mois.")

        var day = date.getDate()

        if(day < firstDay || day > lastDay) throw new Error("Le tableur contient une date non valide : " + date)

        columnIndexByDay[day] = col
        
    }

    // parse categories and location
    for(var row=2 ; row < matrix.length ; row++){
        var locCell = matrix[row][0].trim()
        if(locCell.length > 0){
            locationMap[locCell] = true
            continue
        }

        var category = matrix[row][1].trim().toLowerCase()
        if(row == 1){
            if(category.length != 0) throw new Error("ligne 1 / colonne 2 doit être vide")
        }else{
            if(category.length == 0) throw new Error("ligne " + (row+1) + " / colonne 2 ne doit pas être vide ...")
            categoryMap[category] = true
        }
    }
    var locationList = mapKeys(locationMap)
    var categoryList = mapKeys(categoryMap)
    
    diagnostic.push({status: true, message: "Lieux : " + locationList}) // TODO .length

    diagnostic.push({status: true, message: "Emplacements : " + categoryList}) // TODO .length

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

    

    // parse CSV data
    var location = null
    for(var row=2 ; row < matrix.length ; row++){

        var locCell = matrix[row][0].trim()
        if(locCell.length > 0) location = locCell

        if(location == null) throw new Error("ligne 1 / colonne 1 ne doit pas être vide ...")

        var category = matrix[row][1].trim().toLowerCase()
        if(row == 1){ // TODO never happens
            if(category.length != 0) throw new Error("ligne 1 / colonne 2 doit être vide ...")
        }else{
            if(category.length == 0) throw new Error("ligne " + (row+1) + " / colonne 2 ne doit pas être vide ...")
        }

        for(var day in columnIndexByDay){

            var col = columnIndexByDay[day]
            if(col === null) continue

            var cell = matrix[row][col]

            json[day - firstDay][location][category] = parseInt(cell)
        }

    }

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

    // verify sums and compute top category
    var totalByDay = []
    for(var row=2 ; row < matrix.length ; row++){
        var location = matrix[row][0].trim()

        if(location.length > 0){
            var category = matrix[row][1].trim().toLowerCase()
            if(category != "total") throw new Error("ligne TOTAL attendu pour le lieux " + location)
            for(var day in columnIndexByDay){
                var col = columnIndexByDay[day]
                if(col === null) continue
                var cell = matrix[row][col]
                var totalCSV = parseInt(cell)
                var totalComputed = json[day - firstDay][location]['total']
                if(totalCSV != totalComputed) throw new Error("total non valide pour le lieux " + location + " jour " + day + " : attendu " + totalComputed + ", trouvé " + totalCSV)
                totalByDay[day] = (totalByDay[day]||0) + totalComputed
            }
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

    // verify total
    var totalBorrowsCSV = 0
    for(var day in columnIndexByDay){
        var col = columnIndexByDay[day]
        if(col === null) continue
        var totalComputed = totalByDay[day]
        var totalCSV = parseInt(matrix[1][col])
        if(totalCSV != totalComputed) throw new Error("total non valide pour le jour " + day + " : attendu " + totalComputed + ", trouvé " + totalCSV)
        totalBorrowsCSV += totalComputed
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
    if(totalBorrows != totalBorrowsCSV) throw new Error("totaux non valide : attendu " + totalBorrows + ", trouvé " + totalBorrowsCSV)
    diagnostic.push({status: true, message: "Total des prêts : " + totalBorrows})

    console.log(json)

    jsonString = JSON.stringify(json, null, "    ")

    currentContent = json

    console.log(jsonString)
}